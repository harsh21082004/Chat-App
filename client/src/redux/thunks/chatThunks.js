// src/redux/thunks/chatThunks.js
import { setActivePage } from "../slices/chatSlice";

export const toggleActivePage = (page) => (dispatch) => {
  dispatch(setActivePage(page));
};
