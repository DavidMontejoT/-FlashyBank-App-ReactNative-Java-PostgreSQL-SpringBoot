import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity, StatusBar, Animated, Easing } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { transactionService } from '../../services/transactionService';
import { colors, spacing, fontSizes } from '../../theme/colors';

const HistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  const loadTransactions = async () => {
    try {
      const response = await transactionService.getTransactionHistory();
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    contentOpacity.setValue(0);
    contentTranslateY.setValue(30);
    await loadTransactions();
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando historial...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={styles.gradient}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>Historial</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton, isDarkMode && styles.backButtonDark]}
            >
              <Text style={[styles.backText, isDarkMode && styles.backTextDark]}>← Atrás</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Enviado</Text>
                  <Text style={[styles.summaryAmount, { color: colors.error }]}>
                    -${transactions
                      .filter(t => t.type === 'SENT')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Recibido</Text>
                  <Text style={[styles.summaryAmount, { color: colors.success }]}>
                    +${transactions
                      .filter(t => t.type === 'RECEIVED')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Transactions List */}
            {transactions.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>No hay transacciones aún</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tus transacciones aparecerán aquí</Text>
              </View>
            ) : (
              transactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  delay={index * 80}
                  formatDate={formatDate}
                  formatAmount={formatAmount}
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

// Animated Transaction Item
const TransactionItem = ({ transaction, delay, formatDate, formatAmount, colors, isDarkMode }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: 300 + delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: 300 + delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.transactionCard,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.transactionIcon}>
        <Text style={styles.iconText}>
          {transaction.type === 'SENT' ? '↑' : '↓'}
        </Text>
      </View>

      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionUser, { color: colors.textPrimary }]}>@{transaction.otherUser}</Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{formatDate(transaction.createdAt)}</Text>
        {transaction.description && (
          <Text style={[styles.transactionDesc, { color: colors.textMuted }]}>{transaction.description}</Text>
        )}
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
        <View style={[
          styles.statusBadge,
          transaction.status === 'COMPLETED' && { backgroundColor: colors.success + '20' },
          transaction.status === 'PENDING' && { backgroundColor: colors.warning + '20' },
        ]}>
          <Text style={[
            styles.statusText,
            transaction.status === 'COMPLETED' && { color: colors.success },
            transaction.status === 'PENDING' && { color: colors.warning },
          ]}>
            {transaction.status === 'COMPLETED' ? '✓ Completado' : '⏳ Pendiente'}
          </Text>
        </View>
      </View>
    </Animated.View>
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
  loadingText: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
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
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  summaryLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    height: 72,
    overflow: 'hidden',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: fontSizes.sm,
    marginBottom: 2,
  },
  transactionDesc: {
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default HistoryScreen;
