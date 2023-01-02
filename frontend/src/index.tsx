import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const LightTheme = React.lazy(() => import('./components/themes/lightTheme'));
const DarkTheme = React.lazy(() => import('./components/themes/darkTheme'));

const ThemeSelector = ({ children }: { children: JSX.Element }) => {
    const CHOSEN_THEME = localStorage.getItem('TYPE_OF_THEME') || 'dark';
    return (
        <>
            <React.Suspense fallback={<></>}>
                {(CHOSEN_THEME === 'light') && <LightTheme />}
                {(CHOSEN_THEME === 'dark') && <DarkTheme />}
            </React.Suspense>
            {children}
        </>
    )
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ThemeSelector>
      <App />
  </ThemeSelector>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
