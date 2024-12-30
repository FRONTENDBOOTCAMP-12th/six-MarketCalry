import { html, LitElement } from 'lit';
import { couponStyle } from './couponCss.js';
import { couponTabData } from './data.js';
import commonStyles from '@/styles/common.js';
import pb from '@/api/pocketbase';

class Coupon extends LitElement {
  static styles = [commonStyles, couponStyle];

  static properties = {
    active: { type: String }, // 활성화 된 class 상태
    data: { type: Array }, // 카테고리 탭 관련 외부 데이터 js
    pocketData: { type: Array }, // pocketbase에서 가져오는 데이터
  };

  constructor() {
    super();
    this.active = 'neardy'; // 활성화 class 초기값 설정
    this.data = couponTabData; // 외부 데이터 가져오는 그 변수명으로 기본값 설정
    this.pocketData = {
      // pocketbase에 설정한 field 배열 형태로 데이터 전달
      available: [],
      used: [],
    };
  }

  async connectedCallback() {
    super.connectedCallback();
    await this._fetchData();
  }

  // pocketbase에 쿠폰함 데이터 가져오는 함수
  async _fetchData() {
    try {
      const response = await pb.collection('coupons').getFullList();
      this._getFetchData(response);
    } catch (error) {
      console.error('포켓호스트 데이터를 가져올 수 없습니다', error);
    }
  }

  // pocketbase에 쿠폰함 데이터 중 field가 available , used를 필터링하여 pocketData에 전달 함수
  _getFetchData(items) {
    const filterData = {
      available: items.filter((item) => item.field === 'available'),
      used: items.filter((item) => item.field === 'used'),
    };

    this.pocketData = filterData;
  }

  // 클릭이벤트 함수
  _handleClick(e) {
    const tabId = e.target.dataset.tab;
    this.active = tabId;
  }

  // pocketbase에서 해당하는 필드 조건 처리하여 랜더링 하는 함수
  _renderData() {
    let data = [];

    // '사용완료' 탭일 경우, 'used' 필드에 해당하는 데이터를 렌더링
    if (this.active === 'used') {
      data = this.pocketData.used;

      return html`
        <article class="coupon-section__bottom">
          <h3 class="a11y-hidden">사용완료 쿠폰</h3>

          ${data.map(
            (item) => html`
              <div class="coupon">
                <div class="coupon-inner">
                  <figure class="coupon-icon">
                    <img
                      src="/images/ico_gift.svg"
                      alt=""
                      role="presentation"
                      class="is--disabled"
                    />
                    <figcaption class="a11y-hidden">선물 아이콘</figcaption>
                  </figure>
                  <p class="coupon-text">
                    <b class="is--disabled">${item.store_name}</b>
                    <strong class="is--disabled">${item.description}</strong>
                    <span>${item.expiration_period}</span>
                  </p>
                </div>
                <button type="button" class="coupon-btn is--disabled">
                  <span>${item.status}</span>
                </button>
              </div>
            `
          )}
        </article>
      `;
    }

    // '가까운 순' 탭일 경우, 'available' 필드에 해당하는 데이터를 렌더링 -> 기본 랜더링 화면
    if (this.active === 'neardy') {
      data = this.pocketData.available;

      return html`
        <article class="coupon-section__bottom">
          <h3 class="a11y-hidden">쿠폰</h3>

          ${data.map(
            (item) => html`
              <div class="coupon">
                <div class="coupon-inner">
                  <figure class="coupon-icon">
                    <img src="/images/ico_gift.svg" alt="" role="presentation" />
                    <figcaption class="a11y-hidden">선물 아이콘</figcaption>
                  </figure>
                  <p class="coupon-text">
                    <b>${item.store_name}</b>
                    <strong>${item.description}</strong>
                    <span>${item.expiration_period}</span>
                  </p>
                </div>
                <button type="button" class="coupon-btn">
                  <span>
                    ${item.status.split('\n').map((text) => html`<span>${text}</span>`)}
                  </span>
                </button>
              </div>
            `
          )}
        </article>
      `;
    }

    // 그 외의 탭에서는 "쿠폰함이 비워져있습니다." 메시지를 표시
    return html`
      <div class="empty">
        <img src="/images/empty_coupon.png" alt="쿠폰" />
        <p>쿠폰함이 비워져있습니다.</p>
      </div>
    `;
  }

  render() {
    return html`
      <section class="coupon-section">
        <h2 class="a11y-hidden">쿠폰 페이지 영역</h2>
        <article class="coupon-section__top">
          <h3 class="a11y-hidden" aria-hidden="true">내 쿠폰함</h3>
          <button @click=${() => history.back()} type="button" aria-label="뒤로가기">
            <img src="/images/ico_arrow_left.svg" alt="" role="presentation" />
            <span>내 쿠폰함</span>
          </button>
          <p>쿠폰 사용 방법이 궁금하신가요?</p>
        </article>
        <article class="coupon-section__center">
          <h3 class="a11y-hidden">카테고리 탭 버튼 및 위치 영역</h3>
          <nav class="coupon-category">
            <ul role="tablist">
              ${this.data.map(
                (tab) => html`
                  <li>
                    <button
                      @click="${this._handleClick}"
                      type="button"
                      role="tab"
                      data-tab="${tab.id}"
                      class="${this.active === tab.id ? 'is--active' : ''}"
                    >
                      ${tab.name} ${tab.count !== undefined ? `${tab.count}` : ''}
                    </button>
                  </li>
                `
              )}
            </ul>
          </nav>
          <p class="location">내 위치 <strong>양주시 덕계동</strong></p>
        </article>

        ${this._renderData()}
      </section>
    `;
  }
}

customElements.define('coupon-element', Coupon);