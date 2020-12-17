export default function createFilterItem(name, value, count, on, filter, subtitle = null) {
    return {
        name: name,
        value: value,
        count: count,
        on: on,
        filter: filter,
        subtitle: subtitle
    }
}
