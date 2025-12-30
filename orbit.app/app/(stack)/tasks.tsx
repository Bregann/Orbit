import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationPatch } from '@/helpers/mutations/useMutationPatch';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { AddTaskRequest } from '@/interfaces/api/tasks/AddTaskRequest';
import { GetTaskCategoriesResponse } from '@/interfaces/api/tasks/GetTaskCategoriesResponse';
import { GetTasksResponse } from '@/interfaces/api/tasks/GetTasksResponse';
import { TaskPriorityType } from '@/interfaces/api/tasks/TaskPriorityType';
import { createCommonStyles } from '@/styles/commonStyles';
import { tasksStyles as styles } from '@/styles/tasksStyles';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<number>(1);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriorityType>(TaskPriorityType.Medium);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Fetch tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await authApiClient.get<GetTasksResponse>('/api/Tasks/GetTasks');
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['task-categories'],
    queryFn: async () => {
      const response = await authApiClient.get<GetTaskCategoriesResponse>('/api/Tasks/GetTaskCategories');
      return response.data;
    },
  });

  // Add task mutation
  const addTaskMutation = useMutationPost<AddTaskRequest, void>({
    url: '/api/Tasks/AddNewTask',
    queryKey: ['tasks'],
    invalidateQuery: true,
    onSuccess: () => {
      setShowAddModal(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskCategory(1);
      setNewTaskPriority(TaskPriorityType.Medium);
      setNewTaskDueDate('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add task');
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutationPatch<number, void>({
    url: (taskId: number) => `/api/Tasks/CompleteTask?taskId=${taskId}`,
    queryKey: ['tasks'],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to update task');
    },
  });

  const isLoading = isLoadingTasks || isLoadingCategories;
  
  const tasks = useMemo(() => tasksData?.tasks || [], [tasksData]);
  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.dateCompleted !== null).length;
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
    const dueToday = tasks.filter(t => 
      t.dateCompleted === null && t.dueDate && moment(t.dueDate).isSame(moment(), 'day')
    ).length;
    const overdue = tasks.filter(t => 
      t.dateCompleted === null && t.dueDate && moment(t.dueDate).isBefore(moment(), 'day')
    ).length;

    return { total, completed, completedPercentage, dueToday, overdue };
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (selectedCategory !== null) {
      filtered = filtered.filter(t => t.taskCategoryId === selectedCategory);
    }

    if (!showCompleted) {
      filtered = filtered.filter(t => t.dateCompleted === null);
    }

    return filtered.sort((a, b) => {
      // Sort by priority first (higher priority first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return moment(a.dueDate).diff(moment(b.dueDate));
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }, [tasks, selectedCategory, showCompleted]);

  // Upcoming tasks (next 7 days, not completed)
  const upcomingTasks = useMemo(() => {
    const now = moment();
    const next7Days = moment().add(7, 'days');
    return tasks.filter(t =>
      t.dateCompleted === null &&
      t.dueDate &&
      moment(t.dueDate).isAfter(now) &&
      moment(t.dueDate).isBefore(next7Days)
    );
  }, [tasks]);

  // Tasks by category
  const tasksByCategory = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.taskCategoryId === cat.id).length,
      completed: tasks.filter(t => t.taskCategoryId === cat.id && t.dateCompleted !== null).length,
    }));
  }, [tasks, categories]);

  const toggleTaskComplete = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const deleteTask = (taskId: number) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        // Note: Delete endpoint not provided, would need /api/Tasks/DeleteTask?taskId={id}
        Alert.alert('Info', 'Delete functionality requires API endpoint');
      }},
    ]);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const request: AddTaskRequest = {
      title: newTaskTitle,
      description: newTaskDescription,
      taskCategoryId: newTaskCategory,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || null,
    };

    addTaskMutation.mutate(request);
  };

  const getPriorityColour = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriorityType.Critical: return '#DC2626';
      case TaskPriorityType.High: return '#EF4444';
      case TaskPriorityType.Medium: return '#F59E0B';
      case TaskPriorityType.Low: return '#10B981';
      default: return colors.icon;
    }
  };

  const getPriorityLabel = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriorityType.Critical: return 'Critical';
      case TaskPriorityType.High: return 'High';
      case TaskPriorityType.Medium: return 'Medium';
      case TaskPriorityType.Low: return 'Low';
      default: return '';
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <View style={[commonStyles.header, styles.headerWithButton]}>
            <View>
              <ThemedText type="title">Tasks</ThemedText>
              <ThemedText style={commonStyles.subtitle}>Manage your to-do lists and stay organized</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowAddModal(true)}
            >
              <IconSymbol name="plus" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <View style={commonStyles.statsGrid}>
              <View style={[commonStyles.statCard, { borderLeftColor: colors.tint }]}>
                <ThemedText style={commonStyles.statLabel}>Total Tasks</ThemedText>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {stats.total}
                </ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#10B981' }]}>
                <ThemedText style={commonStyles.statLabel}>Completed</ThemedText>
                <ThemedText type="title" style={[commonStyles.statValue, { color: '#10B981' }]}>
                  {stats.completed}
                </ThemedText>
                <View style={styles.progressBar}>
                  <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                    <View
                      style={[styles.progressBarFill, { width: `${stats.completedPercentage}%`, backgroundColor: '#10B981' }]}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={commonStyles.statsGrid}>
              <View style={[commonStyles.statCard, { borderLeftColor: '#F59E0B' }]}>
                <ThemedText style={commonStyles.statLabel}>Due Today</ThemedText>
                <ThemedText type="title" style={[commonStyles.statValue, stats.dueToday > 0 && { color: '#F59E0B' }]}>
                  {stats.dueToday}
                </ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#EF4444' }]}>
                <ThemedText style={commonStyles.statLabel}>Overdue</ThemedText>
                <ThemedText type="title" style={[commonStyles.statValue, stats.overdue > 0 && { color: '#EF4444' }]}>
                  {stats.overdue}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
              <TouchableOpacity
                style={[styles.filterTab, selectedCategory === null && { backgroundColor: colors.tint }]}
                onPress={() => setSelectedCategory(null)}
              >
                <ThemedText style={[styles.filterTabText, { color: selectedCategory === null ? '#000000' : colors.text }]}>
                  All
                </ThemedText>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.filterTab, selectedCategory === cat.id && { backgroundColor: colors.tint }]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <ThemedText style={[styles.filterTabText, { color: selectedCategory === cat.id ? '#000000' : colors.text }]}>
                    {cat.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.showCompletedToggle}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <View style={[
                styles.checkbox,
                showCompleted && { backgroundColor: colors.tint },
                { borderColor: colors.tint }
              ]}>
                {showCompleted && <IconSymbol name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <ThemedText style={styles.showCompletedText}>Show completed</ThemedText>
            </TouchableOpacity>
          </View>

          {/* All Tasks */}
          <View style={commonStyles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="list.bullet" size={20} color={colors.tint} />
                <ThemedText style={commonStyles.sectionTitle}>All Tasks</ThemedText>
              </View>
              <ThemedText style={[styles.taskCount, { color: colors.tint }]}>
                {filteredTasks.length} {filteredTasks.length === 1 ? 'TASK' : 'TASKS'}
              </ThemedText>
            </View>

            {filteredTasks.length === 0 ? (
              <View style={[
                styles.emptyState,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                }
              ]}>
                <ThemedText style={styles.emptyStateText}>No tasks found</ThemedText>
              </View>
            ) : (
              <View style={styles.tasksList}>
                {filteredTasks.map(task => (
                  <View
                    key={task.id}
                    style={[
                      commonStyles.listItem,
                      styles.taskItem,
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.taskCheckbox}
                      onPress={() => toggleTaskComplete(task.id)}
                    >
                      <View style={[
                        styles.checkbox,
                        task.dateCompleted && { backgroundColor: '#10B981' },
                        { borderColor: task.dateCompleted ? '#10B981' : (isDark ? '#475569' : '#CBD5E1') }
                      ]}>
                        {task.dateCompleted && <IconSymbol name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>

                    <View style={styles.taskContent}>
                      <ThemedText style={[styles.taskTitle, task.dateCompleted && styles.taskTitleCompleted]}>
                        {task.title}
                      </ThemedText>
                      {task.description && (
                        <ThemedText style={styles.taskDescription} numberOfLines={1}>
                          {task.description}
                        </ThemedText>
                      )}
                      <View style={styles.taskMeta}>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColour(task.priority) + '20' }]}>
                          <ThemedText style={[styles.badgeText, { color: getPriorityColour(task.priority) }]}>
                            {getPriorityLabel(task.priority).toUpperCase()}
                          </ThemedText>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: colors.tint + '20' }]}>
                          <ThemedText style={[styles.badgeText, { color: colors.tint }]}>
                            {getCategoryName(task.taskCategoryId).toUpperCase()}
                          </ThemedText>
                        </View>
                        {task.dueDate && (
                          <View style={styles.dueDateContainer}>
                            <IconSymbol name="calendar" size={12} color={colors.icon} />
                            <ThemedText style={styles.dueDate}>
                              {moment(task.dueDate).format('D MMM')}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteTask(task.id)}
                    >
                      <IconSymbol name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Upcoming Tasks */}
          <View style={commonStyles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <IconSymbol name="clock" size={20} color={colors.tint} />
              <ThemedText style={commonStyles.sectionTitle}>Upcoming (7 days)</ThemedText>
            </View>

            {upcomingTasks.length === 0 ? (
              <View style={[
                styles.emptyState,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                }
              ]}>
                <ThemedText style={styles.emptyStateText}>No upcoming tasks</ThemedText>
              </View>
            ) : (
              <View style={styles.upcomingList}>
                {upcomingTasks.map(task => (
                  <View key={task.id} style={[commonStyles.listItem, styles.upcomingItem]}>
                    <IconSymbol name="circle" size={8} color={getPriorityColour(task.priority)} />
                    <ThemedText style={styles.upcomingTitle}>{task.title}</ThemedText>
                    <ThemedText style={styles.upcomingDate}>
                      {moment(task.dueDate).format('D MMM')}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* By Category */}
          <View style={commonStyles.sectionContainer}>
            <View style={styles.sectionTitleRow}>
              <IconSymbol name="square.grid.2x2" size={20} color={colors.tint} />
              <ThemedText style={commonStyles.sectionTitle}>By Category</ThemedText>
            </View>

            <View style={styles.categoriesList}>
              {tasksByCategory.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    commonStyles.listItem,
                    styles.categoryItem,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <ThemedText style={styles.categoryName}>{cat.name}</ThemedText>
                  <ThemedText style={styles.categoryCount}>
                    {cat.completed}/{cat.total}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Add Task Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          >
            <View style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }
            ]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Add Task</ThemedText>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <IconSymbol name="xmark" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.formField}>
                  <ThemedText style={styles.formLabel}>Title *</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        color: isDark ? '#E2E8F0' : '#1E293B',
                      }
                    ]}
                    placeholder="Enter task title"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                  />
                </View>

                <View style={styles.formField}>
                  <ThemedText style={styles.formLabel}>Description</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        color: isDark ? '#E2E8F0' : '#1E293B',
                      }
                    ]}
                    placeholder="Enter task description"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={newTaskDescription}
                    onChangeText={setNewTaskDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.formField}>
                  <ThemedText style={styles.formLabel}>Category</ThemedText>
                  <View style={styles.buttonGroup}>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.buttonGroupItem,
                          newTaskCategory === cat.id && { backgroundColor: colors.tint },
                          {
                            backgroundColor: newTaskCategory === cat.id ? colors.tint : (isDark ? '#0F172A' : '#F8FAFC'),
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                          }
                        ]}
                        onPress={() => setNewTaskCategory(cat.id)}
                      >
                        <ThemedText style={[
                          styles.buttonGroupText,
                          { color: newTaskCategory === cat.id ? '#000000' : colors.text }
                        ]}>
                          {cat.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formField}>
                  <ThemedText style={styles.formLabel}>Priority</ThemedText>
                  <View style={styles.buttonGroup}>
                    {[
                      { value: TaskPriorityType.Low, label: 'Low' },
                      { value: TaskPriorityType.Medium, label: 'Medium' },
                      { value: TaskPriorityType.High, label: 'High' },
                    ].map(({ value, label }) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.buttonGroupItem,
                          {
                            backgroundColor: newTaskPriority === value ? getPriorityColour(value) : (isDark ? '#0F172A' : '#F8FAFC'),
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                          }
                        ]}
                        onPress={() => setNewTaskPriority(value)}
                      >
                        <ThemedText style={[
                          styles.buttonGroupText,
                          newTaskPriority === value && { color: '#FFFFFF' }
                        ]}>
                          {label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.tint }]}
                  onPress={handleAddTask}
                >
                  <ThemedText style={[styles.submitButtonText, { color: '#000000' }]}>Add Task</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}
