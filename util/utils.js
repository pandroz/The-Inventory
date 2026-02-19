

exports.formatShoppingList =(items) => {
    if (items.length === 0) {
        return '🛒 Your shopping list is empty!';
    }

    let message = '╔══════🛒 Shopping List ═════╗\n\n';

    items.forEach((item, index) => {
        console.log('Item: ', item);
        message += `  ${index + 1}│ <b>${item.itemName}</b>\n`;
        message += `   ╰─ Quantità: <code>${item.itemQty}</code>\n\n`;
    });

    message += `╚═══════════════════════╝\n`;
    message += `📦 Totale: <b>${items.length}</b> cose da comprare`;

    return message;
}