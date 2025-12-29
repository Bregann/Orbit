import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { AvailablePot, GetAvailablePotsDto } from '@/interfaces/api/finance/GetAvailablePotsDto';
import { BudgetPot, GetFinanceOverviewDto, PendingTransaction } from '@/interfaces/api/finance/GetFinanceOverviewDto';
import { createCommonStyles } from '@/styles/commonStyles';
import moment from 'moment';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data
const mockAvailablePots: GetAvailablePotsDto = {
  pots: [
    { id: 1, name: 'Tech Fund', currentBalance: 80.00 },
    { id: 2, name: 'Dentist', currentBalance: 40.00 },
    { id: 3, name: 'Food', currentBalance: 142.35 },
    { id: 4, name: 'Petrol', currentBalance: 64.99 },
    { id: 5, name: 'Board', currentBalance: 47.25 },
    { id: 6, name: 'Spare Money', currentBalance: 123.92 },
  ],
};

const mockFinanceData: GetFinanceOverviewDto = {
  currentMonthSummary: {
    moneyIn: 1970.30,
    moneySpent: 409.67,
    totalSaved: 1280.00,
    moneyLeft: 1560.63,
  },
  budgetPots: [
    { id: 1, name: 'Tech Fund', allocated: 80.00, spent: 0.00, remaining: 80.00 },
    { id: 2, name: 'Dentist', allocated: 40.00, spent: 0.00, remaining: 40.00 },
    { id: 3, name: 'Food', allocated: 150.00, spent: 7.65, remaining: 142.35 },
    { id: 4, name: 'Petrol', allocated: 100.00, spent: 35.01, remaining: 64.99 },
    { id: 5, name: 'Board', allocated: 60.00, spent: 12.75, remaining: 47.25 },
    { id: 6, name: 'Spare Money', allocated: 230.53, spent: 106.61, remaining: 123.92 },
  ],
  pendingTransactions: [
    { id: 1, merchant: 'Amazon', amount: 8.54, date: '2025-12-27T18:41:01Z', potType: 'Spare Money', icon: 'amazon' },
  ],
};

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [showPotModal, setShowPotModal] = useState(false);

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  const handleTransactionPress = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction);
    setShowPotModal(true);
  };

  const handlePotSelect = (pot: AvailablePot) => {
    if (selectedTransaction) {
      Alert.alert(
        'Transaction Processed',
        `${selectedTransaction.merchant} (${formatCurrency(selectedTransaction.amount)}) assigned to ${pot.name}`
      );
      setShowPotModal(false);
      setSelectedTransaction(null);
    }
  };

  const renderBudgetPot = (pot: BudgetPot) => {
    const percentage = pot.allocated > 0 ? (pot.spent / pot.allocated) * 100 : 0;
    const isOverBudget = pot.spent > pot.allocated;

    return (
      <View
        key={pot.id}
        style={[
          styles.budgetPot,
          {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          }
        ]}
      >
        <ThemedText style={styles.potName}>{pot.name}</ThemedText>
        <View style={styles.potDivider} />
        
        <View style={styles.potDetails}>
          <View style={styles.potRow}>
            <ThemedText style={styles.potLabel}>Allocated</ThemedText>
            <ThemedText style={styles.potAmount}>{formatCurrency(pot.allocated)}</ThemedText>
          </View>
          
          <View style={styles.potRow}>
            <ThemedText style={[styles.potLabel, { color: '#EF4444' }]}>Spent</ThemedText>
            <ThemedText style={[styles.potAmount, { color: '#EF4444' }]}>
              {formatCurrency(pot.spent)}
            </ThemedText>
          </View>
          
          <View style={styles.potRow}>
            <ThemedText style={[styles.potLabel, { color: '#10B981' }]}>Remaining</ThemedText>
            <ThemedText style={[styles.potAmount, { color: '#10B981' }]}>
              {formatCurrency(pot.remaining)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isOverBudget ? '#EF4444' : colors.tint,
                }
              ]}
            />
          </View>
        </View>
        
        <ThemedText style={styles.potPercentage}>
          {percentage.toFixed(1)}% spent
        </ThemedText>
      </View>
    );
  };

  const renderTransaction = (transaction: PendingTransaction) => {
    return (
      <TouchableOpacity
        key={transaction.id}
        style={[
          commonStyles.listItem,
          styles.transactionItem,
        ]}
        onPress={() => handleTransactionPress(transaction)}
      >
        <View style={styles.transactionIcon}>
          <ThemedText style={styles.merchantInitial}>
            {transaction.merchant.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.transactionInfo}>
          <ThemedText style={styles.merchantName}>{transaction.merchant}</ThemedText>
          <ThemedText style={styles.transactionDate}>
            {moment(transaction.date).format('D MMM YYYY HH:mm')}
          </ThemedText>
        </View>
        <View style={styles.transactionAmount}>
          <ThemedText style={styles.amountText}>{formatCurrency(transaction.amount)}</ThemedText>
          <ThemedText style={styles.potTypeText}>{transaction.potType}</ThemedText>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert('Delete Transaction', `Delete ${transaction.merchant}?`);
          }}
        >
          <IconSymbol name="trash" size={18} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <View style={commonStyles.header}>
            <ThemedText type="title">Finance Overview</ThemedText>
            <ThemedText style={commonStyles.subtitle}>Track your income, expenses, and manage transactions</ThemedText>
          </View>

          {/* Current Month Summary */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Current Month Summary</ThemedText>
          </View>

          <View style={{ gap: 12, marginBottom: 24 }}>
            <View style={commonStyles.statsGrid}>
              <View style={[commonStyles.statCard, { borderLeftColor: '#10B981' }]}>
                <View style={styles.statHeader}>
                  <ThemedText style={commonStyles.statLabel}>Money In</ThemedText>
                  <ThemedText style={styles.currencySymbol}>£</ThemedText>
                </View>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {mockFinanceData.currentMonthSummary.moneyIn.toFixed(2)}
                </ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#EF4444' }]}>
                <View style={styles.statHeader}>
                  <ThemedText style={commonStyles.statLabel}>Money Spent</ThemedText>
                  <ThemedText style={styles.currencySymbol}>£</ThemedText>
                </View>
                <ThemedText type="title" style={[commonStyles.statValue, { color: '#EF4444' }]}>
                  {mockFinanceData.currentMonthSummary.moneySpent.toFixed(2)}
                </ThemedText>
              </View>
            </View>

            <View style={commonStyles.statsGrid}>
              <View style={[commonStyles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                <View style={styles.statHeader}>
                  <ThemedText style={commonStyles.statLabel}>Total Saved</ThemedText>
                  <ThemedText style={styles.currencySymbol}>£</ThemedText>
                </View>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {mockFinanceData.currentMonthSummary.totalSaved.toFixed(2)}
                </ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#3B82F6' }]}>
                <View style={styles.statHeader}>
                  <ThemedText style={commonStyles.statLabel}>Money Left</ThemedText>
                  <ThemedText style={styles.currencySymbol}>£</ThemedText>
                </View>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {mockFinanceData.currentMonthSummary.moneyLeft.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Monthly Budget Breakdown */}
          <View style={commonStyles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="chart.bar" size={20} color={colors.tint} />
                <ThemedText style={commonStyles.sectionTitle}>Monthly Budget Breakdown</ThemedText>
              </View>
              <ThemedText style={[styles.potCount, { color: colors.tint }]}>
                {mockFinanceData.budgetPots.length} POTS
              </ThemedText>
            </View>

            <View style={styles.budgetGrid}>
              {mockFinanceData.budgetPots.map(renderBudgetPot)}
            </View>
          </View>

          {/* Transactions To Process */}
          <View style={commonStyles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="doc.text" size={20} color={colors.tint} />
                <ThemedText style={commonStyles.sectionTitle}>Transactions To Process</ThemedText>
              </View>
              <ThemedText style={[styles.pendingCount, { color: mockFinanceData.pendingTransactions.length > 0 ? '#10B981' : colors.tint }]}>
                {mockFinanceData.pendingTransactions.length} PENDING
              </ThemedText>
            </View>

            {mockFinanceData.pendingTransactions.length === 0 ? (
              <View style={[
                styles.emptyState,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                }
              ]}>
                <ThemedText style={styles.emptyEmoji}>🎉</ThemedText>
                <ThemedText style={styles.emptyTitle}>All caught up!</ThemedText>
                <ThemedText style={styles.emptySubtitle}>No transactions need processing at the moment</ThemedText>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {mockFinanceData.pendingTransactions.map(renderTransaction)}
              </View>
            )}
          </View>

          {/* Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Pot Selection Modal */}
        <Modal
          visible={showPotModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPotModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPotModal(false)}
          >
            <View style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
            ]}>
              <View style={styles.modalHandle} />
              
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText style={styles.modalTitle}>Select Pot</ThemedText>
                  {selectedTransaction && (
                    <ThemedText style={styles.modalSubtitle}>
                      {selectedTransaction.merchant} • {formatCurrency(selectedTransaction.amount)}
                    </ThemedText>
                  )}
                </View>
                <TouchableOpacity onPress={() => setShowPotModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.potList} showsVerticalScrollIndicator={false}>
                {mockAvailablePots.pots.map((pot) => (
                  <TouchableOpacity
                    key={pot.id}
                    style={[
                      styles.potOption,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      }
                    ]}
                    onPress={() => handlePotSelect(pot)}
                  >
                    <View style={styles.potOptionInfo}>
                      <ThemedText style={styles.potOptionName}>{pot.name}</ThemedText>
                      <ThemedText style={styles.potOptionBalance}>
                        Available: {formatCurrency(pot.currentBalance)}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={colors.icon} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: '600',
  },
  potCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pendingCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  budgetPot: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  potName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  potDivider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    marginBottom: 12,
  },
  potDetails: {
    gap: 8,
    marginBottom: 12,
  },
  potRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  potAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  potPercentage: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },
  transactionsList: {
    gap: 6,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  potTypeText: {
    fontSize: 11,
    opacity: 0.6,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  potList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  potOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  potOptionInfo: {
    flex: 1,
  },
  potOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  potOptionBalance: {
    fontSize: 13,
    opacity: 0.6,
  },
});
