(function () {
	const API_ENDPOINT = "/api/barcode";
	const SCAN_COOLDOWN = 2500;

	const $ = (id) => document.getElementById(id);

	let scanning = false;
	let fullscreen = false;
	let lastValue = null;
	let lastTime = 0;

	let currentTrack = null;
	let torchOn = false;
	let currentDeviceId = null;
	let camerasLoaded = false;

	function setStatus(text) {
		$("bcStatusText").textContent = text;
	}

	async function loadCameras() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const cams = devices.filter((d) => d.kind === "videoinput");

		const select = $("bcCameraSelect");
		select.innerHTML = "";

		cams.forEach((cam, i) => {
			const opt = document.createElement("option");
			opt.value = cam.deviceId;
			opt.textContent = cam.label || `Camera ${i + 1}`;

			// Prefer back camera
			if (/back|rear|environment/i.test(cam.label)) {
				opt.selected = true;
				currentDeviceId = cam.deviceId;
			}

			select.appendChild(opt);
		});

		if (cams.length > 1) {
			select.classList.remove("d-none");
		}

		camerasLoaded = true;
	}

	function stopScanner() {
		try {
			Quagga.stop();
		} catch (_) {}

		scanning = false;
		currentTrack = null;

		$("bcViewport").classList.add("d-none");
		$("bcStartBtn").classList.remove("d-none");
		$("bcStopBtn").classList.add("d-none");
		$("bcFullscreenBtn").classList.add("d-none");
		$("bcTorchBtn").classList.add("d-none");

		closeFullscreen();
		setStatus("Fotocamera pronta");
	}

	async function startScanner() {
		stopScanner();

		const container = fullscreen ? $("bcOverlay") : $("bcViewport");
		container.classList.remove("d-none");

		setStatus("Scansione in corso…");

		Quagga.init(
			{
				inputStream: {
					type: "LiveStream",
					target: container,
					constraints: currentDeviceId ? { deviceId: { exact: currentDeviceId } } : { facingMode: { ideal: "environment" } },
					area: {
						top: "20%",
						right: "10%",
						left: "10%",
						bottom: "20%",
					},
				},
				locator: {
					patchSize: "medium",
					halfSample: false,
				},
				numOfWorkers: navigator.hardwareConcurrency || 4,
				frequency: 10,
				decoder: {
					readers: ["ean_reader", "ean_8_reader", "upc_reader", "code_128_reader"],
				},
				locate: true,
			},
			async (err) => {
				if (err) {
					console.error(err);
					setStatus("Errore scanner");
					return;
				}

				Quagga.start();
				scanning = true;

				currentTrack = Quagga.CameraAccess.getActiveTrack();

				$("bcTorchBtn").classList.remove("d-none");

				setupCameraFeatures();

				// Load cameras AFTER permission
				if (!camerasLoaded) {
					await loadCameras();
				}
			},
		);

		Quagga.offDetected();
		Quagga.onDetected(onDetected);

		$("bcStartBtn").classList.add("d-none");
		$("bcStopBtn").classList.remove("d-none");
		$("bcFullscreenBtn").classList.remove("d-none");
	}

	function setupCameraFeatures() {
		if (!currentTrack) return;

		const caps = currentTrack.getCapabilities?.();

		if (caps?.focusMode) {
			currentTrack
				.applyConstraints({
					advanced: [{ focusMode: "continuous" }],
				})
				.catch(() => {});
		}
	}

	function toggleTorch() {
		if (!currentTrack) return;

		torchOn = !torchOn;

		currentTrack
			.applyConstraints({
				advanced: [{ torch: torchOn }],
			})
			.catch(() => {});
	}

	function openFullscreen() {
		fullscreen = true;
		$("bcOverlay").style.display = "block";

		if (scanning) startScanner();
	}

	function closeFullscreen() {
		if (!fullscreen) return;

		fullscreen = false;
		$("bcOverlay").style.display = "none";

		if (scanning) startScanner();
	}

	function onDetected(data) {
		const code = data?.codeResult?.code;
		if (!code) return;

		const now = Date.now();
		if (code === lastValue && now - lastTime < SCAN_COOLDOWN) return;

		lastValue = code;
		lastTime = now;

		if (navigator.vibrate) navigator.vibrate(120);

		$("bcResultValue").textContent = code;
		$("bcResultFormat").textContent = data.codeResult.format;
		$("bcResult").classList.remove("d-none");

		stopScanner();
		callApi(code, data.codeResult.format);
	}

	async function callApi(barcode, format) {
		setStatus("Ricerca prodotto…");

		const res = await axios
			.post(
				API_ENDPOINT,
				{ barcode, format },
				{
					headers: {
						"Content-Type": "application/json",
						"x-csrf-token": _csrf,
					},
				},
			)
			.then((res) => {
				if (res.status == 200) {
					const data = res.data;

					($("name").value = data.itemName);
                    ($("imageUrl").value = data.imageUrl);
                    ($("selectedImage").value = data.imageUrl);


					setStatus("Completato ✓");
				} else {
					throw Error(res.data.message);
				}
			})
			.catch((err) => {
				setStatus("Errore API");
				toastMessage("error", "Error", err);
				console.error(err);
			});
	}

	// Camera switching
	$("bcCameraSelect").addEventListener("change", function () {
		currentDeviceId = this.value;
		if (scanning) startScanner();
	});

	$("bcManualInputSubmit").addEventListener("click", function () {
		const code = $("bcManualInput").value;
		if (code) callApi(code, "MANUAL");
	});

	$("bcStartBtn").addEventListener("click", startScanner);
	$("bcStopBtn").addEventListener("click", stopScanner);
	$("bcFullscreenBtn").addEventListener("click", openFullscreen);
	$("bcOverlay").addEventListener("click", closeFullscreen);
	$("bcTorchBtn").addEventListener("click", toggleTorch);
})();
