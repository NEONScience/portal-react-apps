import { createEpicMiddleware } from "redux-observable";
import { ajax } from "rxjs/ajax";
import { fetchAppStateEpic } from "./app";

export const getCombinedEpics = () => fetchAppStateEpic;

export const getEpicMiddleware = () => {
  let epicMiddleware = createEpicMiddleware({
    dependencies: { ajax: ajax }
  });

  return epicMiddleware;
}
