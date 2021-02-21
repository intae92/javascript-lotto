import { lottoGame } from '../store.js';
import {
  LOTTO_PRICE,
  NUMBER_LIST_LENGTH,
  MIN_NUMBER,
  MAX_NUMBER,
} from '../constants.js';
import lottoGameUI from './ui.js';

const getRandomNumberList = () => {
  const numberList = [];
  while (numberList.length < NUMBER_LIST_LENGTH) {
    const randomNumber = Math.floor(MIN_NUMBER + Math.random() * MAX_NUMBER);
    if (!numberList.includes(randomNumber)) {
      numberList.push(randomNumber);
    }
  }

  return numberList;
};

const addLottoItems = (lottoItemCount) => {
  for (let i = 0; i < lottoItemCount; i += 1) {
    const numberList = getRandomNumberList();
    lottoGame.addLottoItem(numberList);
  }
};

export default {
  purchaseLottoItems(cost) {
    const lottoItemCount = cost / LOTTO_PRICE;
    lottoGame.initLottoItemList();
    addLottoItems(lottoItemCount);
    lottoGameUI.renderResult(lottoGame.lottoItemList);
  },
  toggleLottoItemNumbers(checked) {
    if (checked) {
      lottoGameUI.displayLottoNumbers();
      return;
    }
    lottoGameUI.hideLottoNumbers();
  },
  initToggleButton() {
    lottoGameUI.resetToggleButton();
  },
};