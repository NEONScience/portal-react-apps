import { isStringNonEmpty } from 'portal-core-components/lib/util/typeUtil';

export interface SearchSlice {
  found: boolean;
  text: string;
}

export const calcSearchSlice = (input: string, token: string): SearchSlice[] => {
  const slice: SearchSlice[] = [];
  if (!isStringNonEmpty(input) || !isStringNonEmpty(token)) {
    return [{ found: false, text: input }];
  }
  const appliedToken = token.trim().toLowerCase();
  let searchableInput = input.toLowerCase();
  let originInput = input;
  let tokenIdx = searchableInput.indexOf(appliedToken);
  if (tokenIdx < 0) {
    return [{ found: false, text: input }];
  }
  while (tokenIdx > -1) {
    // Push unmatched up to matched slice
    if (tokenIdx > 0) {
      slice.push({ found: false, text: originInput.slice(0, tokenIdx) });
    }
    // Push matched slice
    slice.push({ found: true, text: originInput.slice(tokenIdx, tokenIdx + token.length) });
    // Get new slice of input, compute potential next matched index
    searchableInput = searchableInput.slice(tokenIdx + token.length, searchableInput.length);
    originInput = originInput.slice(tokenIdx + token.length, originInput.length);
    tokenIdx = searchableInput.indexOf(input);
  }
  if (originInput.length > 0) {
    slice.push({ found: false, text: originInput });
  }
  return slice;
};
