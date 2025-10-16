import { onSendEmail } from '../../util/api';
import { storableError } from '../../util/errors';
import { parse } from '../../util/urlHelpers';

// ================ Action types ================ //

export const CREATE_GIFT_CARD_REQUEST = 'app/giftCard/CREATE_GIFT_CARD_REQUEST';
export const CREATE_GIFT_CARD_SUCCESS = 'app/giftCard/CREATE_GIFT_CARD_SUCCESS';
export const CREATE_GIFT_CARD_ERROR = 'app/giftCard/CREATE_GIFT_CARD_ERROR';

export const CLEAR_GIFT_CARD_STATE = 'app/giftCard/CLEAR_GIFT_CARD_STATE';

// ================ Reducer ================ //

const initialState = {
  createGiftCardInProgress: false,
  createGiftCardError: null,
  giftCardData: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case CREATE_GIFT_CARD_REQUEST:
      return {
        ...state,
        createGiftCardInProgress: true,
        createGiftCardError: null,
      };
    case CREATE_GIFT_CARD_SUCCESS:
      return {
        ...state,
        createGiftCardInProgress: false,
        giftCardData: payload,
      };
    case CREATE_GIFT_CARD_ERROR:
      console.error(payload); // eslint-disable-line
      return {
        ...state,
        createGiftCardInProgress: false,
        createGiftCardError: payload,
      };
    case CLEAR_GIFT_CARD_STATE:
      return {
        ...state,
        createGiftCardError: null,
        giftCardData: null,
      };
    default:
      return state;
  }
}

// ================ Selectors ================ //

// export const isCreateGiftCardInProgress = state => {
//   return state.giftCard.createGiftCardInProgress;
// };

// export const getcreateGiftCardError = state => {
//   return state.giftCard.createGiftCardError;
// };

// export const getGiftCardData = state => {
//   return state.giftCard.giftCardData;
// };

// ================ Action creators ================ //

export const createGiftCardRequest = () => ({
  type: CREATE_GIFT_CARD_REQUEST,
});

export const createGiftCardSuccess = giftCardData => ({
  type: CREATE_GIFT_CARD_SUCCESS,
  payload: giftCardData,
});

export const createGiftCardError = error => ({
  type: CREATE_GIFT_CARD_ERROR,
  payload: error,
  error: true,
});

export const clearGiftCardState = () => ({
  type: CLEAR_GIFT_CARD_STATE,
});

// ================ Thunks ================ //

export const sendinquiry = (params) => (dispatch, getState) => {
    console.log(params, '&&& &&& => params');
    
  dispatch(createGiftCardRequest());

  return onSendEmail(params)
    .then(response => {
      dispatch(createGiftCardSuccess(response.data));
      return response;
    })
    .catch(error => {
      const storableErr = storableError(error);
      dispatch(createGiftCardError(storableErr));
      throw error;
    });
};

export const loadData = (params, search, config) => dispatch => {
  const queryParams = parse(search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });
  return Promise.all([]);
};