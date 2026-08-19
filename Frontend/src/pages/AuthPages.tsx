import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { Icon } from "../components/Icon";
import { Logo } from "../components/AppHeader";
import { images } from "../data/mockData";
import { getCurrentUser, login, register } from "../api/api";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [loginStatus, setLoginStatus] = useState(-1);
  const [loginMessage, setLoginMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const handleLogin = async () => {
    setError(false);
    setLoginStatus(-1);
    setLoading(true);
    try {
      const response = await login({
        email: form.email,
        password: form.password,
      })
      setLoginMessage(response.message);
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      const { user } = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      setLoginStatus(1);
      const destination = (
        location.state as {
          from?: { pathname?: string; search?: string };
        } | null
      )?.from;
      navigate(
        destination?.pathname
          ? `${destination.pathname}${destination.search ?? ""}`
          : "/eventos",
        { replace: true },
      );
    } catch (error: unknown) {
      setLoginMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Não foi possível realizar o login.",
      )
      window.setTimeout(() => {
        setLoading(false);
        setError(true);
        setLoginStatus(0);
      }, 1400);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-form">
        <div className="auth-box">
          <Logo />
          <h1>Entrar</h1>
          <p>Bem-vindo de volta! Faça login na sua conta.</p>

          {loginStatus !== -1 &&
            <div className={loginStatus ? 'success-banner' : 'error-banner'}>
              {loginMessage}
            </div>
          }

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <FormField
              label="E-mail"
              icon="mail"
              placeholder="nome@exemplo.com"
              type="email"
              error={error}
              required
              name='email'
              value={form.email} onChange={handleChange}
            />
            <div className="password-field">
              <FormField
                label="Senha"
                icon="lock"
                placeholder="••••••••"
                type={visible ? "text" : "password"}
                error={error}
                required
                name='password'
                value={form.password} onChange={handleChange}
              />
              <button type="button" onClick={() => setVisible(!visible)}>
                <Icon>{visible ? "visibility_off" : "visibility"}</Icon>
              </button>
            </div>
            <div className="form-options">
              <label>
                <input type="checkbox" /> Lembrar de mim
              </label>
              <a href="#forgot">Esqueceu a senha?</a>
            </div>
            <button type='submit' className="button primary wide" disabled={loading}>
              {loading ? <span className="spinner" /> : "Entrar"}
            </button>
          </form>
          <p className="auth-switch">
            Não possui uma conta? <Link to="/criar-conta">Criar conta</Link>
          </p>
        </div>
      </section>
      <section
        className="auth-visual"
        style={{ backgroundImage: `url(${images.login})` }}
      >
        <div>
          <h2>Conectando você aos melhores momentos.</h2>
          <p>
            Acesse a plataforma Vivaê para gerenciar suas produções,
            controlar acessos ou garantir seus ingressos com total segurança.
          </p>
        </div>
      </section>
    </main>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    lastname: '',
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  const handleRegister = async () => {
    try {
      const response = await register({
        username: form.username,
        lastname: form.lastname,
        email: form.email,
        password: form.password,
      });
      alert(response.message);
      navigate('/login');
    } catch (error: unknown) {
      alert(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Não foi possível criar a conta.",
      );
    }
  }
  return (
    <main className="center-page">
      <section className="auth-card">
        <Logo />
        <h1>Crie sua conta</h1>
        <p>Comece agora e viva experiências inesquecíveis.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <div className="two-columns">
            <FormField label="Nome" placeholder="Seu nome" name='username' value={form.username} onChange={handleChange} />
            <FormField label="Sobrenome" placeholder="Seu sobrenome" name='lastname' value={form.lastname} onChange={handleChange} />
          </div>
          <FormField
            label="E-mail"
            icon="mail"
            placeholder="nome@exemplo.com"
            type="email"
            name='email'
            value={form.email} onChange={handleChange}
          />
          <FormField
            label="Senha"
            icon="lock"
            placeholder="Mínimo de 8 caracteres"
            type="password"
            name='password'
            value={form.password} onChange={handleChange}
          />
          <label className="check">
            <input type="checkbox" required /> Aceito os Termos de Uso e
            Política de Privacidade
          </label>
          <button type='submit' className="button primary wide">Criar conta</button>
        </form>
        <p className="auth-switch">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  );
}
