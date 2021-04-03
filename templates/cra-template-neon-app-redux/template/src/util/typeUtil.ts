import { UnknownRecord, NullableRecord } from 'portal-core-components/lib/types/core';
import { exists, existsNonEmpty } from 'portal-core-components/lib/util/typeUtil';

/**
 * Resolves any value to a record by
 * drilling down nested props to coerce to a usable type.
 * @param o the object to interrogate
 * @param drillProps array of nested props to drill down to
 * @return The coerced inner prop
 */
export const resolveAny = (
  o: never,
  ...drillProps: string[]
): UnknownRecord => {
  if (!exists(o) || !existsNonEmpty(drillProps)) {
    return {};
  }
  const curProp: string = drillProps[0];
  if (drillProps.length === 1) {
    if (!exists(o[curProp])) {
      return {};
    }
    return o[curProp] as UnknownRecord;
  }
  const next: NullableRecord = o[curProp] as NullableRecord;
  if (!exists(next)) {
    return {};
  }
  return resolveAny(
    next as never,
    ...drillProps.slice(1, drillProps.length),
  );
};

const TypeUtil = {
  resolveAny,
};

export default TypeUtil;
