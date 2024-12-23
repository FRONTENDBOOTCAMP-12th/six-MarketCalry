import { LitElement, html, css } from 'lit';
import resetStyles from '@/styles/reset.js';
import pb from '@/api/pocketbase';
import '../SignUp/logo.js';
import '../SignUp/formInput.js';
import '../SignUp/submitButton.js';

class LoginForm extends LitElement {
  static properties = {
    idValue: { type: String },
    pwValue: { type: String },
  };

  constructor() {
    super();
    this.idValue = '';
    this.pwValue = '';
  }

  static styles = [
    resetStyles,
    css`
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        clip: rect(0, 0, 0, 0);
        overflow: hidden;
      }

      .login-section {
        max-width: 30rem;
        margin: 0 auto;
        padding: 2rem;
        margin-top: 2rem;
      }

      h1 {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 2rem;
        color: white;
      }

      .help-links {
        display: flex;
        justify-content: center;
        padding-right: 2rem;
        padding-left: 2rem;
        gap: 1rem;
      }

      .help-links a {
        text-decoration: none;
      }
    `,
  ];

  firstUpdated() {
    document.documentElement.style.setProperty('--background-color', '#171f31');
    document.documentElement.style.setProperty('--color', '#fff');
  }

  async _fetchData() {
    try {
      const id = this.idValue.trim();
      const pw = this.pwValue.trim();

      if (!id || !pw) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
      }
      await pb.collection('users').authWithPassword(id, pw);

      const authData = localStorage.getItem('pocketbase_auth');
      const { record, token } = authData ? JSON.parse(authData) : { record: null, token: null };

      localStorage.setItem(
        'auth',
        JSON.stringify({ isAuth: !!record, user: record, token: token })
      );

      alert('로그인 성공');
      location.href = '/src/pages/reserved/index.html';
    } catch (error) {
      alert('로그인 실패 ' + error.message);
    }
  }

  _handleInputChange(e) {
    const { detail } = e;

    if (detail.id === 'user-id') {
      this.idValue = detail.value;
    } else if (detail.id === 'user-password') {
      this.pwValue = detail.value;
    }
  }

  _handleLogin(e) {
    e.preventDefault();
    this._fetchData();
  }

  render() {
    return html`
      <section class="login-section">
        <div class="container">
          <app-logo link="./loginPage.html"></app-logo>

          <h1>로그인</h1>

          <form-input
            label="아이디"
            type="text"
            id="user-id"
            placeholder="아이디를 입력해주세요"
            .value="${this.idValue}"
            @input-change="${this._handleInputChange}"
          ></form-input>
          <form-input
            label="비밀번호"
            type="password"
            id="user-password"
            placeholder="비밀번호를 입력해주세요"
            .value="${this.pwValue}"
            @input-change="${this._handleInputChange}"
          ></form-input>

          <submit-button @click=${this._handleLogin} text="로그인"></submit-button>
        </div>
      </section>
      <section class="help-links">
        <h2 class="sr-only">계정 관련 도움말</h2>
        <a class="find" href="/findId">아이디 찾기</a>
        <a class="find" href="/findPw">비밀번호 찾기</a>
        <a class="sign-up" href="/src/pages/sign-up/index.html">회원가입</a>
      </section>
    `;
  }
}

customElements.define('login-form', LoginForm);
