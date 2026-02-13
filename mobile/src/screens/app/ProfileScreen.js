import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image, TouchableOpacity, Animated, Easing, StatusBar, Switch } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useQuickMode } from '../../context/QuickModeContext';
import { useTheme, themes } from '../../context/ThemeContext';
import { userService } from '../../services/userService';
import { spacing, fontSizes } from '../../theme/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUserProfile } = useAuth();
  const {
    isQuickModeEnabled,
    enableQuickMode,
    disableQuickMode,
    formatTimeRemaining,
    timeRemaining
  } = useQuickMode();

  const {
    currentTheme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    autoMode,
    toggleAutoMode,
    getColors,
  } = useTheme();

  const colors = getColors();

  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileScale = useRef(new Animated.Value(0.9)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      setNewUsername(user.username);
    }
    startAnimations();
  }, [user]);

  const startAnimations = () => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(profileScale, {
        toValue: 1,
        delay: 200,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleUpdateProfile = async () => {
    if (!newUsername || newUsername.trim().length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    const response = await userService.updateProfile(newUsername.trim());

    if (response.success) {
      setSuccess('Perfil actualizado correctamente');
      setEditing(false);
      await refreshUserProfile();
    } else {
      setError(response.error);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleToggleQuickMode = async () => {
    if (isQuickModeEnabled) {
      await disableQuickMode();
    } else {
      await enableQuickMode();
      setSuccess('Modo Rápido activado por 2 horas');
    }
  };

  const handleToggleDarkMode = async () => {
    await toggleDarkMode();
    setSuccess(isDarkMode ? 'Modo claro activado' : 'Modo oscuro activado');
  };

  const handleToggleAutoMode = async () => {
    await toggleAutoMode();
    setSuccess(autoMode ? 'Modo manual activado' : 'Modo automático activado');
  };

  const handleSelectTheme = async (themeId) => {
    await setTheme(themeId);
    setSuccess(`Tema ${themes[themeId].name} seleccionado`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCurrentTimeMode = () => {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) {
      return '🌙 Noche';
    }
    return '☀️ Día';
  };

  if (!user) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={styles.gradient}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={{ opacity: headerOpacity }}>
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Image
                  source={require('../../../assets/logoflashy.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, isDarkMode && styles.backButtonDark]}>
                <Text style={[styles.backText, isDarkMode && styles.backTextDark]}>← Atrás</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: profileOpacity, transform: [{ scale: profileScale }] }}>
            {/* Profile Avatar */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.username, { color: colors.textPrimary }]}>{user.username}</Text>
              <Text style={[styles.memberSince, { color: colors.textMuted }]}>Miembro desde {formatDate(user.createdAt)}</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: contentOpacity }}>
            {/* Quick Mode Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary + '40' }]}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.cardIcon}>⚡</Text>
                    <Text style={[styles.cardName, { color: colors.primary }]}>Modo Rápido</Text>
                  </View>
                  <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                    {isQuickModeEnabled ? `${formatTimeRemaining()} restantes` : 'Acceso rápido a transferencias'}
                  </Text>
                </View>
                <Switch
                  value={isQuickModeEnabled}
                  onValueChange={handleToggleQuickMode}
                  trackColor={{ false: 'rgba(128,128,128,0.3)', true: colors.primary }}
                  thumbColor={isQuickModeEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>

              {isQuickModeEnabled && timeRemaining && (
                <View style={styles.timerContainer}>
                  <View style={[styles.timerBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                    <View
                      style={[
                        styles.timerProgress,
                        {
                          width: `${Math.min((timeRemaining / (2 * 60 * 60 * 1000)) * 100, 100)}%`,
                          backgroundColor: colors.primary
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.timerText, { color: colors.primary }]}>{formatTimeRemaining()}</Text>
                </View>
              )}
            </View>

            {/* Dark Mode Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary + '40' }]}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.cardIcon}>🌙</Text>
                    <Text style={[styles.cardName, { color: colors.primary }]}>Modo Oscuro</Text>
                  </View>
                  <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                    {autoMode ? `${getCurrentTimeMode()} - Automático` : (isDarkMode ? 'Activo' : 'Inactivo')}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{ false: 'rgba(128,128,128,0.3)', true: colors.primary }}
                  thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                  disabled={autoMode}
                />
              </View>

              {/* Auto mode toggle */}
              <TouchableOpacity onPress={handleToggleAutoMode} style={styles.autoModeButton}>
                <Text style={styles.autoModeIcon}>🕐</Text>
                <Text style={[styles.autoModeText, { color: autoMode ? colors.primary : colors.textMuted }]}>
                  {autoMode ? 'Automático activado' : 'Activar automático (día/noche)'}
                </Text>
                <Text style={[styles.autoModeStatus, { color: autoMode ? colors.primary : colors.textMuted }]}>
                  {autoMode ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Themes Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary + '30' }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>🎨 Temas</Text>
              <Text style={[styles.themesDesc, { color: colors.textMuted }]}>
                Personaliza los colores de tu app
              </Text>

              <View style={styles.themesGrid}>
                {Object.entries(themes).map(([id, theme]) => (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.themeButton,
                      currentTheme === id && { borderColor: theme.primary, backgroundColor: theme.primary + '15' },
                      { borderColor: currentTheme === id ? theme.primary : (isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)') }
                    ]}
                    onPress={() => handleSelectTheme(id)}
                  >
                    <View style={[styles.themeColorCircle, { backgroundColor: theme.primary }]}>
                      <View style={[styles.themeColorInner, { backgroundColor: theme.primaryLight }]} />
                    </View>
                    <Text style={[styles.themeName, currentTheme === id && { color: theme.primary, fontWeight: '600' }, isDarkMode && styles.themeNameLight]}>
                      {theme.name}
                    </Text>
                    {currentTheme === id && (
                      <Text style={[styles.themeCheck, { color: theme.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Profile Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary + '20' }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>Información</Text>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Usuario</Text>
                {editing ? (
                  <TextInput
                    value={newUsername}
                    onChangeText={setNewUsername}
                    mode="outlined"
                    dense
                    disabled={loading}
                    style={styles.input}
                    outlineColor={colors.primary + '50'}
                    activeOutlineColor={colors.primary}
                    textColor={colors.textPrimary}
                    theme={{
                      colors: {
                        primary: colors.primary,
                        onSurfaceVariant: colors.textMuted,
                      }
                    }}
                  />
                ) : (
                  <Text style={[styles.value, { color: colors.textPrimary }]}>@{user.username}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Saldo</Text>
                <Text style={[styles.balanceValue, { color: colors.primary }]}>
                  ${parseFloat(user.balance).toFixed(2)}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Rol</Text>
                <Text style={[styles.value, { color: colors.textPrimary }]}>{user.role}</Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Estado</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, user.enabled ? styles.activeDot : styles.inactiveDot]} />
                  <Text style={[styles.value, { color: user.enabled ? colors.success : colors.error }]}>
                    {user.enabled ? 'Activo' : 'Inactivo'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            {editing ? (
              <View style={styles.actions}>
                <Button
                  mode="contained"
                  onPress={handleUpdateProfile}
                  loading={loading}
                  disabled={loading}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                  labelStyle={[styles.buttonLabel, { color: isDarkMode ? '#fff' : '#000' }]}
                >
                  Guardar Cambios
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setEditing(false);
                    setNewUsername(user.username);
                    setError('');
                  }}
                  disabled={loading}
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                  labelStyle={{ color: colors.primary }}
                >
                  Cancelar
                </Button>
              </View>
            ) : (
              <View style={styles.actions}>
                <Button
                  mode="contained"
                  onPress={() => setEditing(true)}
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  contentStyle={styles.buttonContent}
                  labelStyle={[styles.buttonLabel, { color: isDarkMode ? '#fff' : '#000' }]}
                  icon="account-edit"
                >
                  Editar Perfil
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.logoutButtonLabel}
                  icon="logout"
                >
                  Cerrar Sesión
                </Button>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={styles.errorSnackbar}
        >
          {error}
        </Snackbar>

        <Snackbar
          visible={!!success}
          onDismiss={() => setSuccess('')}
          duration={2000}
          style={styles.successSnackbar}
        >
          {success}
        </Snackbar>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  logoContainer: {
    padding: spacing.sm,
    borderRadius: 16,
  },
  logo: {
    width: 40,
    height: 40,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 30,
  },
  backButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  backText: {
    color: '#000',
    fontWeight: '600',
  },
  backTextDark: {
    color: '#ffffff',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '700',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: 14,
  },
  card: {
    borderRadius: 24,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
  },
  timerContainer: {
    marginTop: spacing.md,
  },
  timerBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  autoModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    gap: spacing.sm,
  },
  autoModeIcon: {
    fontSize: 16,
  },
  autoModeText: {
    flex: 1,
    fontSize: 14,
  },
  autoModeStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  themesDesc: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  themeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 16,
    borderWidth: 2,
  },
  themeColorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeColorInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  themeName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  themeNameLight: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  themeCheck: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: '#22c55e',
  },
  inactiveDot: {
    backgroundColor: '#ef4444',
  },
  input: {
    backgroundColor: 'transparent',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  primaryButton: {
    borderRadius: 30,
  },
  secondaryButton: {
    borderRadius: 30,
  },
  logoutButton: {
    borderColor: '#ef4444',
    borderRadius: 30,
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonLabel: {
    color: '#ef4444',
  },
  errorSnackbar: {
    backgroundColor: '#ef4444',
  },
  successSnackbar: {
    backgroundColor: '#22c55e',
  },
});

export default ProfileScreen;
