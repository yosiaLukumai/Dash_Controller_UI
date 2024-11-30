export function FormatStringAlias(rider_id: string, numberPad: number, alias: string) {
    const paddedId = rider_id.toString().padStart(numberPad, '0');
    return `${alias}-${paddedId}`;
}
