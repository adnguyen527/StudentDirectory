export function filterCenter(coll, center) {
    return coll.find({"Center": String(center)});
}
export default filterCenter;