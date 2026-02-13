import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity, StatusBar, Animated, Easing, Switch } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useQuickMode } from '../../context/QuickModeContext';
import { useTheme } from '../../context/ThemeContext';
import { transactionService } from '../../services/transactionService';
import { spacing, fontSizes } from '../../theme/colors';

const HomeScreen = ({ navigation }) => {
  const { user, refreshUserProfile } = useAuth();
  const {
    isQuickModeEnabled,
    enableQuickMode,
    disableQuickMode,
    formatTimeRemaining,
    timeRemaining
  } = useQuickMode();
  const { isDarkMode, currentTheme, getColors } = useTheme();
  const colors = getColors();

  const [balance, setBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;
  const transactionsOpacity = useRef(new Animated.Value(0)).current;
  const navOpacity = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    try {
      const [balanceResponse, historyResponse] = await Promise.all([
        transactionService.getBalance(),
        transactionService.getTransactionHistory(),
      ]);

      if (balanceResponse.success) {
        const balanceValue = parseFloat(balanceResponse.data.balance);
        setBalance(balanceValue);
        animateBalance(balanceValue);
      }

      if (historyResponse.success) {
        setTransactions(historyResponse.data.slice(0, 5));
      }

      await refreshUserProfile();
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const animateBalance = (targetBalance) => {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = (targetBalance * easeOut).toFixed(2);
      setDisplayBalance(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(actionsOpacity, {
      toValue: 1,
      duration: 600,
      delay: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(transactionsOpacity, {
      toValue: 1,
      duration: 600,
      delay: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(navOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    cardOpacity.setValue(0);
    cardTranslateY.setValue(30);
    actionsOpacity.setValue(0);
    transactionsOpacity.setValue(0);
    await loadData();
  };

  const handleGoToProfile = () => {
    navigation.navigate('Profile');
  };

  const handleToggleQuickMode = async () => {
    if (isQuickModeEnabled) {
      await disableQuickMode();
    } else {
      await enableQuickMode();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Background with gradient based on theme */}
      <View style={[styles.backgroundGradient, {
        backgroundColor: isDarkMode ? colors.gradientStart : colors.background
      }]}>
        {/* Decorative circles for light mode */}
        {!isDarkMode && (
          <>
            <View style={[styles.decorCircle1, { backgroundColor: colors.primary + '15' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: colors.primaryDark + '10' }]} />
            <View style={[styles.decorCircle3, { backgroundColor: colors.primaryLight + '08' }]} />
          </>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.username}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Quick Mode Switch */}
            <View style={[styles.quickModeSwitch, {
              backgroundColor: isDarkMode ? colors.primary + '20' : colors.primary + '15',
              borderColor: colors.primary + '40'
            }]}>
              <Text style={styles.quickModeIcon}>⚡</Text>
              <Switch
                value={isQuickModeEnabled}
                onValueChange={handleToggleQuickMode}
                trackColor={{ false: 'rgba(128,128,128,0.3)', true: colors.primary }}
                thumbColor={isQuickModeEnabled ? (isDarkMode ? '#fff' : '#000') : '#f4f3f4'}
                style={styles.switch}
              />
            </View>

            <TouchableOpacity onPress={handleGoToProfile} style={[styles.avatarButton, { backgroundColor: colors.primary }]}>
              <Image
                source={require('../../../assets/logoflashy.png')}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Mode Timer Badge */}
        {isQuickModeEnabled && timeRemaining && (
          <Animated.View style={[styles.quickModeBadge, {
            opacity: actionsOpacity,
            backgroundColor: isDarkMode ? colors.primary + '20' : colors.glassBackground,
            borderColor: colors.primary + '40'
          }]}>
            <Text style={styles.badgeIcon}>⚡</Text>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Modo Rápido activo</Text>
            <Text style={[styles.badgeTimer, { color: colors.textSecondary }]}>{formatTimeRemaining()}</Text>
          </Animated.View>
        )}

        {/* Balance Card with Animation */}
        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.balanceLabel}>Balance Total</Text>
            <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>${displayBalance}</Text>

            <View style={styles.changeRow}>
              <Text style={[styles.changePositive, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }]}>↑ +2.5%</Text>
              <Text style={[styles.changeText, { color: colors.textMuted }]}>vs último mes</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions with Animation */}
        <Animated.View style={[styles.actionsSection, { opacity: actionsOpacity }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Acciones Rápidas</Text>

          <View style={styles.actionsGrid}>
            {/* Send Button */}
            <TouchableOpacity
              style={[styles.actionButton, isDarkMode ? {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary + '30'
              } : {
                backgroundColor: colors.glassBackground,
                borderColor: colors.glassBorder,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }]}
              onPress={() => navigation.navigate('Transfer')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.actionIconText, { color: isDarkMode ? '#fff' : '#000' }]}>↑</Text>
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Enviar</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>Dinero</Text>
            </TouchableOpacity>

            {/* Receive Button */}
            <TouchableOpacity
              style={[styles.actionButton, isDarkMode ? {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary + '30'
              } : {
                backgroundColor: colors.glassBackground,
                borderColor: colors.glassBorder,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.actionIconText, { color: isDarkMode ? '#fff' : '#000' }]}>↓</Text>
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Recibir</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>Dinero</Text>
            </TouchableOpacity>

            {/* History Button */}
            <TouchableOpacity
              style={[styles.actionButton, isDarkMode ? {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary + '30'
              } : {
                backgroundColor: colors.glassBackground,
                borderColor: colors.glassBorder,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }]}
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                <Text style={[styles.actionIconText, { color: isDarkMode ? '#fff' : '#000' }]}>📋</Text>
              </View>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Ver</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>Historial</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Transactions with Animation */}
        <Animated.View style={[styles.transactionsSection, { opacity: transactionsOpacity }]}>
          <View style={styles.transactionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Transacciones</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver Todo →</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={[styles.emptyContainer, isDarkMode ? {
              backgroundColor: colors.card,
              borderColor: colors.border
            } : {
              backgroundColor: colors.glassBackground,
              borderColor: colors.glassBorder,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay transacciones aún</Text>
            </View>
          ) : (
            transactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                delay={index * 100}
                formatDate={formatDate}
                formatAmount={formatAmount}
                colors={colors}
                isDarkMode={isDarkMode}
              />
            ))
          )}
        </Animated.View>

      </ScrollView>

      {/* Bottom Navigation with Glass/Blur Effect */}
      <Animated.View style={[styles.bottomNavContainer, { opacity: navOpacity }]}>
        {isDarkMode ? (
          <BlurView intensity={20} tint="dark" style={styles.bottomNavBlur}>
            <View style={[styles.bottomNav, {
              backgroundColor: 'rgba(10, 10, 10, 0.8)',
              borderTopColor: colors.primary + '30'
            }]}>
              {renderNavItems()}
            </View>
          </BlurView>
        ) : (
          <View style={[styles.bottomNavLight, {
            backgroundColor: colors.glassBackground,
            borderTopColor: colors.glassBorder,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }]}>
            {renderNavItems()}
          </View>
        )}
      </Animated.View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        backgroundColor={colors.error}
      >
        {error}
      </Snackbar>
    </View>
  );

  function renderNavItems() {
    return (
      <>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, { color: colors.primary, opacity: 0.6 }]}>💳</Text>
          <Text style={[styles.navLabel, { color: colors.primary, opacity: 0.6 }]}>Tarjetas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItemActive}>
          <Text style={[styles.navIconActive, { color: colors.primary }]}>🏠</Text>
          <Text style={[styles.navLabelActive, { color: colors.primary }]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={[styles.navIcon, { color: colors.primary, opacity: 0.6 }]}>📊</Text>
          <Text style={[styles.navLabel, { color: colors.primary, opacity: 0.6 }]}>Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[styles.navIcon, { color: colors.primary, opacity: 0.6 }]}>👤</Text>
          <Text style={[styles.navLabel, { color: colors.primary, opacity: 0.6 }]}>Perfil</Text>
        </TouchableOpacity>
      </>
    );
  }
};

// Separate component for transaction items with individual animation
const TransactionItem = ({ transaction, delay, formatDate, formatAmount, colors, isDarkMode }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: 700 + delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: 700 + delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.transactionItem,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: isDarkMode ? colors.card : colors.glassBackground,
          borderColor: isDarkMode ? colors.border : colors.glassBorder,
          shadowColor: isDarkMode ? 'transparent' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0 : 0.05,
          shadowRadius: isDarkMode ? 0 : 4,
          elevation: isDarkMode ? 0 : 2,
        },
      ]}
    >
      <View style={styles.transactionLeft}>
        <Text style={[styles.transactionIcon, isDarkMode && styles.transactionIconLight]}>
          {transaction.type === 'SENT' ? '↑' : '↓'}
        </Text>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionUser, { color: colors.textPrimary }]}>@{transaction.otherUser}</Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{formatDate(transaction.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: transaction.type === 'SENT' ? colors.sent : colors.received },
          ]}
        >
          {transaction.type === 'SENT' ? '-' : '+'}
          {formatAmount(transaction.amount)}
        </Text>
        <Text style={styles.transactionStatus}>
          {transaction.status === 'COMPLETED' ? '✓' : '⏳'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 200,
    left: -50,
  },
  decorCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 300,
    left: 50,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: fontSizes.regular,
    marginBottom: 4,
  },
  userName: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
  },
  userNameLight: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickModeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickModeIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Quick Mode Badge
  quickModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 30,
    borderWidth: 1,
    gap: spacing.sm,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgeTimer: {
    fontSize: 12,
    marginLeft: 'auto',
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 32,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
  },
  balanceLabel: {
    fontSize: fontSizes.regular,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    marginBottom: 16,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePositive: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  changeText: {
    fontSize: fontSizes.md,
  },

  // Quick Actions
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    height: 100,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: fontSizes.regular,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: fontSizes.sm,
  },

  // Transactions
  transactionsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    height: 72,
    overflow: 'hidden',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionIconLight: {
    fontSize: 24,
    marginRight: 12,
    color: '#ffffff',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionUserLight: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: fontSizes.sm,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionAmountLight: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: fontSizes.md,
  },

  // Bottom Navigation with Glass/Blur
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavBlur: {
    overflow: 'hidden',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  bottomNavLight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  navItem: {
    width: 60,
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    width: 60,
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 24,
  },
  navIconActive: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: fontSizes.sm,
  },
  navLabelActive: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
});

export default HomeScreen;
