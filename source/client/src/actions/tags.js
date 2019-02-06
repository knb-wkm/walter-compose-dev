import * as actionTypes from "../actionTypes";

// タグ管理画面(index, view, edit, create, delete)
export const requestFetchTags = () => ({
  type: actionTypes.REQUEST_FETCH_TAGS
});

export const searchTagSimple = (keyword) => ({
  type: actionTypes.SEARCH_TAG_SIMPLE, keyword
});

export const requestFetchTag = (tag_id) => ({
  type: actionTypes.REQUEST_FETCH_TAG, tag_id
});

export const changeTagLabel = (value) => ({
  type: actionTypes.CHANGE_TAG_LABEL, value
});

export const changeTagColor = (value) => ({
  type: actionTypes.CHANGE_TAG_COLOR, value
});

export const saveTagLabel = (tag) => ({
  type: actionTypes.SAVE_TAG_LABEL, tag
});

export const saveTagColor = (tag) => ({
  type: actionTypes.SAVE_TAG_COLOR, tag
});

export const deleteTag = (tag_id, history) => ({
  type: actionTypes.DELETE_TAG, tag_id, history
});

export const initTag = (tag) => ({
  type: actionTypes.INIT_TAG, tag
});

export const initTags = (tags) => ({
  type: actionTypes.INIT_TAGS, tags
});

export const saveTagValidationError = (errors) => ({
  type: actionTypes.SAVE_TAG_VALIDATION_ERROR, errors
});

export const createTag = (tag, history) => ({
  type: actionTypes.CREATE_TAG, tag, history
});

export const toggleColorPicker = () => ({
  type: actionTypes.TOGGLE_COLOR_PICKER
});
