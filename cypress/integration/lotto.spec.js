import { INVALID_PRICE_ERROR } from "../../src/js/lotto/constants/error_messages.js";

describe("lotto 미션 테스트", () => {
  before(() => {
    cy.visit("http://127.0.0.1:5500/");
  });

  it("구입 금액에 1000원 단위가 아닌 금액을 입력하면 경고 메시지를 보여준다.", () => {
    const alertCalled = cy.stub();
    cy.on("window:alert", alertCalled);

    cy.get("#price-input").type("1234");
    cy.get("#price-submit-button")
      .click()
      .then(() => {
        expect(alertCalled.getCall(0)).to.be.calledWith(INVALID_PRICE_ERROR);
      });
  });

  it("구입 금액에 0원을 입력하면 경고 메시지를 보여준다.", () => {
    const alertCalled = cy.stub();
    cy.on("window:alert", alertCalled);

    cy.get("#price-input").type("0");
    cy.get("#price-submit-button")
      .click()
      .then(() => {
        expect(alertCalled.getCall(0)).to.be.calledWith(INVALID_PRICE_ERROR);
      });
  });

  it("구입 금액에 음수을 입력하면 경고 메시지를 보여준다.", () => {
    const alertCalled = cy.stub();
    cy.on("window:alert", alertCalled);

    cy.get("#price-input").type("-1000");
    cy.get("#price-submit-button")
      .click()
      .then(() => {
        expect(alertCalled.getCall(0)).to.be.calledWith(INVALID_PRICE_ERROR);
      });
  });

  it("구입 금액에 아무것도 입력하지 않으면 경고 메시지를 보여준다.", () => {
    const alertCalled = cy.stub();
    cy.on("window:alert", alertCalled);

    cy.get("#price-submit-button")
      .click()
      .then(() => {
        expect(alertCalled.getCall(0)).to.be.calledWith(INVALID_PRICE_ERROR);
      });
  });

  it("확인버튼 클릭시 금액에 맞는 수의 로또번호 입력 폼을 보여준다.", () => {
    cy.get("#price-input").type("3000");
    cy.get("#price-submit-button").click();
    cy.get("#purchase-form").should("be.visible");
    cy.get("#lotto-numbers-input").children().should("have.length", 3);
    for (let i = 1; i < 4; i++) {
      cy.get(`#lotto-numbers-input > li:nth-child(${i}) > input`).should(
        ($inputs) => {
          expect($inputs).to.have.length(6);
        }
      );
    }
  });

  it("알맞지 않은 금액을 입력하면 모든 view가 초기화 된다.", () => {
    cy.get("#price-input").type("3");
    cy.get("#price-submit-button").click();
    cy.get("#price-input").should("have.value", "");
    cy.get("#purchase-form").should("not.be.visible");
  });

  it("구매 버튼 클릭시 구입한 로또를 보여준다.", () => {
    cy.get("#price-input").type("3000");
    cy.get("#price-submit-button").click();
    cy.get("#purchase-button").click();
    cy.get("#confirmation").should("be.visible");
    cy.get("#lotto-list-label").should("have.text", "총 3개를 구매하였습니다.");
    cy.get("#lotto-tickets").children().should("have.length", 3);
  });

  it("사용자가 입력한 칸에 대해서는 그 번호대로 로또를 구매한다.", () => {
    cy.reload();
    cy.get("#price-input").type("3000");
    cy.get("#price-submit-button").click();
    [...Array(6)].forEach((_, i) =>
      cy
        .get(
          `#lotto-numbers-input > li:nth-child(1) > input:nth-child(${i + 1})`
        )
        .type(i + 1)
    );
    cy.get("#purchase-button").click();
    cy.get(".switch").click();
    cy.get(".lotto-numbers")
      .eq(0)
      .then((value) => {
        const isCorrect = value[0].innerText
          .split(",")
          .every((v, i) => Number(v) === i + 1);
        expect(isCorrect).to.be.true;
      });
  });

  it("번호보기가 true이면 로또 번호를 보여준다.", () => {
    cy.get(".lotto-numbers").each(($winningNumber) => {
      const isNumbers = $winningNumber[0].innerText
        .split(",")
        .every((value) => !isNaN(value.trim()));

      expect(isNumbers).to.be.true;
    });
  });

  it("지난 주 당첨번호를 입력하고 1등인지 확인한다.", () => {
    const baseNumber = new Array(45).fill(0);

    cy.reload();
    cy.get("#price-input").type("1000{enter}");
    cy.get("#purchase-button").click();
    cy.get("#lotto-list-label").should("have.text", "총 1개를 구매하였습니다.");
    cy.get(".switch").click();
    cy.get(".lotto-numbers")
      .eq(0)
      .then((value) => {
        value[0].innerText.split(",").forEach((v, i) => {
          baseNumber[v - 1] = 1;
          cy.get(`input[name='winning-number']:nth-child(${i + 1})`).type(v);
        });
      });
    cy.get("input[name='bonus-number']:nth-child(1)").type(
      baseNumber.indexOf(0) + 1
    );
    cy.get("#open-result-modal-button")
      .click()
      .then(() => {
        cy.get("#prize-table > tr:nth-child(5) > td:nth-child(3)").should(
          "have.text",
          "1개"
        );
        cy.get("#earning-rate").should(
          "have.text",
          "당신의 총 수익률은 200000000%입니다."
        );
      });
  });

  it("다시 시작 버튼을 눌렀을 때 모든 뷰가 초기화 되는지 확인한다.", () => {
    cy.get("#restart-button").click();
    cy.get("#price-input").should("have.value", "");
    cy.get("#confirmation").should("not.be.visible");
  });
});