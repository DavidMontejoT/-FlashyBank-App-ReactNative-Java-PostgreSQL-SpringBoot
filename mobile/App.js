import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { QuickModeProvider } from './src/context/QuickModeContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import ThemeWrapper from './src/theme/ThemeWrapper';

export default function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <AuthProvider>
          <QuickModeProvider>
            <RootNavigator />
          </QuickModeProvider>
        </AuthProvider>
      </ThemeWrapper>
    </ThemeProvider>
  );
}
