import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Input, Boton } from '../componentes/comunes';
import { validarEmail, validarPassword } from '../utilidades';

export const Login = () => {
  const navigate = useNavigate();
  const { iniciarSesion, registrarse, cargando, error } = useAuthStore();
  
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errores, setErrores] = useState<{ [key: string]: string }>({});

  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!validarEmail(email)) {
      nuevosErrores.email = 'Email inválido';
    }

    const validacionPassword = validarPassword(password);
    if (!validacionPassword.valido) {
      nuevosErrores.password = validacionPassword.mensaje;
    }

    if (esRegistro && password !== passwordConfirm) {
      nuevosErrores.passwordConfirm = 'Las contraseñas no coinciden';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    try {
      if (esRegistro) {
        await registrarse(email, password);
      } else {
        await iniciarSesion(email, password);
      }
      navigate('/tablero');
    } catch (error) {
      console.error('Error de autenticación:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Gestor de Tareas
          </h1>
          <p className="text-gray-600">
            {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarSubmit} className="space-y-4">
          <Input
            etiqueta="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errores.email}
            required
          />

          <Input
            etiqueta="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errores.password}
            required
          />

          {esRegistro && (
            <Input
              etiqueta="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              error={errores.passwordConfirm}
              required
            />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Boton
            type="submit"
            variante="primario"
            className="w-full"
            cargando={cargando}
          >
            {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </Boton>
        </form>

        {/* Toggle Login/Registro */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setEsRegistro(!esRegistro);
              setErrores({});
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {esRegistro
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        {/* Nota temporal */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Nota de desarrollo:</strong> Por ahora el backend usa autenticación temporal.
            La autenticación real se implementará en el siguiente paso.
          </p>
        </div>
      </div>
    </div>
  );
};
