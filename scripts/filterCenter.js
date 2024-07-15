export function filterCenter(coll, center) {
    return coll.find({"Center": String(center)});
}