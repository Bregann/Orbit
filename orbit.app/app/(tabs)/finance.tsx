import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationPatch } from '@/helpers/mutations/useMutationPatch';
import { GetAllPotDataDto } from '@/interfaces/api/finance/GetAllPotDataDto';
import { GetSpendingPotDropdownOptionsDto } from '@/interfaces/api/finance/GetSpendingPotDropdownOptionsDto';
import { GetUnprocessedTransactionsDto, TransactionsTableRow } from '@/interfaces/api/finance/GetUnprocessedTransactionsDto';
import { UpdateTransactionRequest } from '@/interfaces/api/finance/UpdateTransactionRequest';
import { createCommonStyles } from '@/styles/commonStyles';
import { financeStyles as styles } from '@/styles/financeStyles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinanceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionsTableRow | null>(null);
  const [showPotModal, setShowPotModal] = useState(false);

  // Fetch pot dropdown options
  const { data: potOptionsData, isLoading: isLoadingPots } = useQuery({
    queryKey: ['pot-options'],
    queryFn: async () => {
      const response = await authApiClient.get<GetSpendingPotDropdownOptionsDto>('/api/Pots/GetSpendingPotDropdownOptions');
      return response.data;
    },
  });

  // Fetch all pot data
  const { data: allPotData, isLoading: isLoadingAllPots } = useQuery({
    queryKey: ['all-pot-data'],
    queryFn: async () => {
      const response = await authApiClient.get<GetAllPotDataDto>('/api/Pots/GetAllPotData');
      return response.data;
    },
  });

  // Fetch unprocessed transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['unprocessed-transactions'],
    queryFn: async () => {
      const response = await authApiClient.get<GetUnprocessedTransactionsDto>('/api/Transactions/GetUnprocessedTransactions');
      return response.data;
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutationPatch<UpdateTransactionRequest, void>({
    url: '/api/Transactions/UpdateTransaction',
    queryKey: ['unprocessed-transactions'],
    invalidateQuery: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pot-data'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update transaction');
    },
  });

  const isLoading = isLoadingPots || isLoadingAllPots || isLoadingTransactions;

  const handleTransactionPress = (transaction: TransactionsTableRow) => {
    setSelectedTransaction(transaction);
    setShowPotModal(true);
  };

  const handlePotSelect = (potId: number, potName: string) => {
    if (selectedTransaction) {
      const request: UpdateTransactionRequest = {
        transactionId: selectedTransaction.id,
        potId: potId,
      };
      
      updateTransactionMutation.mutate(request);
      
      Alert.alert(
        'Transaction Processed',
        `${selectedTransaction.merchantName} (${selectedTransaction.transactionAmount}) assigned to ${potName}`
      );
      setShowPotModal(false);
      setSelectedTransaction(null);
    }
  };

  const renderBudgetPot = (pot: { potId: number; potName: string; amountAllocated: string; amountLeft: string; amountSpent: string }) => {
    const allocated = parseFloat(pot.amountAllocated.replace('£', ''));
    const spent = parseFloat(pot.amountSpent.replace('£', ''));
    const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
    const isOverBudget = spent > allocated;

    return (
      <View
        key={pot.potId}
        style={[
          styles.budgetPot,
          {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          }
        ]}
      >
        <ThemedText style={styles.potName}>{pot.potName}</ThemedText>
        <View style={styles.potDivider} />
        
        <View style={styles.potDetails}>
          <View style={styles.potRow}>
            <ThemedText style={styles.potLabel}>Allocated</ThemedText>
            <ThemedText style={styles.potAmount}>{pot.amountAllocated}</ThemedText>
          </View>
          
          <View style={styles.potRow}>
            <ThemedText style={[styles.potLabel, { color: '#EF4444' }]}>Spent</ThemedText>
            <ThemedText style={[styles.potAmount, { color: '#EF4444' }]}>
              {pot.amountSpent}
            </ThemedText>
          </View>
          
          <View style={styles.potRow}>
            <ThemedText style={[styles.potLabel, { color: '#10B981' }]}>Remaining</ThemedText>
            <ThemedText style={[styles.potAmount, { color: '#10B981' }]}>
              {pot.amountLeft}
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

  const renderTransaction = (transaction: TransactionsTableRow) => {
    const potName = potOptionsData?.potOptions.find(p => p.potId === transaction.potId)?.potName || 'Unassigned';
    
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
            {transaction.merchantName.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.transactionInfo}>
          <ThemedText style={styles.merchantName}>{transaction.merchantName}</ThemedText>
          <ThemedText style={styles.transactionDate}>
            {moment(transaction.transactionDate).format('D MMM YYYY HH:mm')}
          </ThemedText>
        </View>
        <View style={styles.transactionAmount}>
          <ThemedText style={styles.amountText}>{transaction.transactionAmount}</ThemedText>
          <ThemedText style={styles.potTypeText}>{potName}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Calculate summary stats from pot data
  const totalAllocated = allPotData?.spendingPots.reduce((sum, pot) => sum + parseFloat(pot.amountAllocated.replace('£', '')), 0) || 0;
  const totalSpent = allPotData?.spendingPots.reduce((sum, pot) => sum + parseFloat(pot.amountSpent.replace('£', '')), 0) || 0;
  const totalLeft = allPotData?.spendingPots.reduce((sum, pot) => sum + parseFloat(pot.amountLeft.replace('£', '')), 0) || 0;
  const totalSavings = allPotData?.savingsPots.reduce((sum, pot) => sum + parseFloat(pot.amountSaved.replace('£', '')), 0) || 0;

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
                  {totalAllocated.toFixed(2)}
                </ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#EF4444' }]}>
                <View style={styles.statHeader}>
                  <ThemedText style={commonStyles.statLabel}>Money Spent</ThemedText>
                  <ThemedText style={styles.currencySymbol}>£</ThemedText>
                </View>
                <ThemedText type="title" style={[commonStyles.statValue, { color: '#EF4444' }]}>
                  {totalSpent.toFixed(2)}
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
                  {totalSavings.toFixed(2)}
                </ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#3B82F6' }]}>
                <View style={styles.statHeader}>
                  <ThemedText style={commonStyles.statLabel}>Money Left</ThemedText>
                  <ThemedText style={styles.currencySymbol}>£</ThemedText>
                </View>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {totalLeft.toFixed(2)}
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
                {allPotData?.spendingPots.length || 0} POTS
              </ThemedText>
            </View>

            <View style={styles.budgetGrid}>
              {allPotData?.spendingPots.map(renderBudgetPot)}
            </View>
          </View>

          {/* Transactions To Process */}
          <View style={commonStyles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="doc.text" size={20} color={colors.tint} />
                <ThemedText style={commonStyles.sectionTitle}>Transactions To Process</ThemedText>
              </View>
              <ThemedText style={[styles.pendingCount, { color: (transactionsData?.unprocessedTransactions.length || 0) > 0 ? '#10B981' : colors.tint }]}>
                {transactionsData?.unprocessedTransactions.length || 0} PENDING
              </ThemedText>
            </View>

            {!transactionsData?.unprocessedTransactions.length ? (
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
                {transactionsData?.unprocessedTransactions.map(renderTransaction)}
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
                      {selectedTransaction.merchantName} • {selectedTransaction.transactionAmount}
                    </ThemedText>
                  )}
                </View>
                <TouchableOpacity onPress={() => setShowPotModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.potList} showsVerticalScrollIndicator={false}>
                {potOptionsData?.potOptions.map((pot) => (
                  <TouchableOpacity
                    key={pot.potId}
                    style={[
                      styles.potOption,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      }
                    ]}
                    onPress={() => handlePotSelect(pot.potId, pot.potName)}
                  >
                    <View style={styles.potOptionInfo}>
                      <ThemedText style={styles.potOptionName}>{pot.potName}</ThemedText>
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
