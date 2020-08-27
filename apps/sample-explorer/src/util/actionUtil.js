import {
  SAMPLE_ID_LIST_EXCEPTION,
  SAMPLE_ID_LIST_EXCEPTION_MESSAGE
} from "../util/constants";

export const handleError = (dispatch, action, error) => {
  error.response.text().then((e) => {
    if (e.indexOf(SAMPLE_ID_LIST_EXCEPTION) > -1) {
      dispatch(action(SAMPLE_ID_LIST_EXCEPTION_MESSAGE));
    } else {
      dispatch(action(e));
    }
  });
}
