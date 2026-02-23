const _ = require('lodash');

exports.formatShoppingList = (items) => {
    if (items.length === 0) {
        return '🛒 Your shopping list is empty!';
    }

    let message = '╔══════🛒 Shopping List ═════╗\n\n';

    items.forEach((item, index) => {
        message += `  ${index + 1}│ <b>${item.itemName}</b>\n`;
        message += `   ╰─ Quantità: <code>${item.itemQty}</code>\n\n`;
    });

    message += `╚═══════════════════════╝\n`;
    message += `📦 Totale: <b>${items.length}</b> cose da comprare`;

    return message;
}


exports.formatCloseToExpiryList = (items) => {
    if (items.length === 0) {
        return '🚨 Non hai oggetti vicini alla scadenza o scaduti.';
    }

    let message = '';

    let expiredItems = _.filter(items, item => new Date() > new Date(item.expirationDate));
    if (expiredItems.length > 0) {
        message += `╔══════════ 🚨 Prodotti scaduti (${expiredItems.length}) ══════════╗\n\n`;
        expiredItems.forEach((item, index) => {
            message += `  ${index + 1}│ <b>${item.name}</b> : <code>${Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24) * -1)} giorni fa</code>\n`;
        });
        message += `╚════════════════════════════════════╝\n`;
    }

    message += `\n\n`; // Add spacing between sections

    let closeToExpiryItems = _.filter(items, item => {
        const expirationDate = new Date(item.expirationDate);
        const today = new Date();
        const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
    });
    if (closeToExpiryItems.length > 0) {
        message += `╔═══════ 🚨 Prodotti vicini alla scadenza (${closeToExpiryItems.length})  ═════╗\n\n`;
        closeToExpiryItems.forEach((item, index) => {
            message += `  ${index + 1}│ <b>${item.name}</b> : <code>${item.qty}</code>\n`;
            message += `   ╰─ Scadenza: <code>${new Date(item.expirationDate).toLocaleDateString() || 'N/A'}</code>\n`;
            message += `   ╰─ Categoria: <code>${item.category || 'N/A'}</code>\n\n`;
        });
        message += `╚════════════════════════════════════╝\n`;
    }


    return message;
}


exports.formatLowStockList = (items) => {
    if (items.length === 0) {
        return '🔔 Non hai oggetti sotto le soglie di quantità bassa.';
    }

    let message = `╔══════🔔   Oggetti con quantità bassa (${items.length})   ══════╗\n\n`;

    items.forEach((item, index) => {
        message += `  ${index + 1}│ <b>${item.name}</b>: <code>${item.qty}</code>\n`;
        message += `   ╰─ Quantità soglia: <code>${item.lowStockAlert}</code>\n`;
        message += `   ╰─ Categoria: <code>${item.category}</code>\n\n`;

    });

    message += `╚════════════════════════════════════╝\n`;

    return message;
}


exports.formatTodoList = (todos) => {
    if (todos.length === 0) {
        return '✅ Non hai todo in scadenza a breve!';
    }

    let message = '';

    let expiredTodos = todos.filter(todo => new Date(todo.completeBy).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0));
    if (expiredTodos.length > 0) {
        message = `╔══════════ ✅ To-Do scadute (${expiredTodos.length})  ═══════════╗\n\n`;
        expiredTodos.forEach((todo, index) => {
            let scadenza = Math.ceil((new Date(todo.completeBy) - new Date()) / (1000 * 60 * 60 * 24));

            message += `  ${index + 1}│ <b>${todo.description}</b>\n`;
            message += `   ╰─ Da completare entro il: <code>${new Date(todo.completeBy).toLocaleDateString('it-IT')}</code>\n`;
            message += `   ╰─ Categoria: <code>${todo.category || 'N/A'}</code>\n`;
            message += `   ╰─ Scaduta: <code>${scadenza * -1} giorni fa</code>\n`;
        });
        message += `╚════════════════════════════════════╝\n\n\n`;
    }


    let dueSoonTodos = todos.filter(todo => {
        const completeBy = new Date(todo.completeBy);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return completeBy >= today;
    });

    if (dueSoonTodos.length > 0) {
        message += `╔═══════ ⏰ Todo in scadenza a breve (${dueSoonTodos.length}) ═══════╗\n\n`;
        dueSoonTodos.forEach((todo, index) => {
            message += `  ${index + 1}│ <b>${todo.description}</b>\n`;
            message += `   ╰─ Da completare entro il: <code>${new Date(todo.completeBy).toLocaleDateString('it-IT')}</code>\n`;
            message += `   ╰─ Categoria: <code>${todo.category || 'N/A'}</code>\n`;
            message += `   ╰─ Mancano: <code>${Math.ceil((new Date(todo.completeBy) - new Date()) / (1000 * 60 * 60 * 24))} giorni</code>\n`;
        });
        message += `╚════════════════════════════════════╝\n`;
    }

    return message;
}