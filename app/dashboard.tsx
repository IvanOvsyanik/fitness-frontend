import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState("Новичок");
  const [stats, setStats] = useState({ total_workouts: 0, total_minutes: 0 });
  const [achievements, setAchievements] = useState<any[]>([]);

  const weekDays = [
    { id: 1, label: "П", active: false },
    { id: 2, label: "В", active: false },
    { id: 3, label: "С", active: false },
    { id: 4, label: "Ч", active: false },
    { id: 5, label: "П", active: false },
    { id: 6, label: "С", active: false },
    { id: 7, label: "В", active: false },
  ];

  // Функция загрузки данных
  const fetchStats = async () => {
    try {
      // ВНИМАНИЕ: Замени 192.168.X.X на свой локальный IPv4 адрес!
      const response = await fetch(
        "http://192.168.100.13:8000/api/v1/users/test_user_001/stats",
      );
      const data = await response.json();

      if (response.ok) {
        setUserRank(data.user_info.rank);
        if (data.stats) {
          setStats({
            total_workouts: data.stats.total_workouts || 0,
            total_minutes: data.stats.total_minutes || 0,
          });
          if (data.stats.achievements) {
            setAchievements(data.stats.achievements);
          }
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки дашборда:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновляем данные при каждом фокусе на экран (например, после завершения тренировки)
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, []),
  );

  const handleStartWorkout = () => {
    router.push("/pre-workout");
  };

  const handleResetPlan = async () => {
    setResetModalVisible(false);
    try {
      // Очищаем локальную метку регистрации
      await AsyncStorage.removeItem("hasOnboarded");
      // Возвращаем на экран анкеты
      router.replace("/");
    } catch (e) {
      console.error("Ошибка при сбросе плана:", e);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#A0D2EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>С возвращением,</Text>
              <Text style={styles.title}>Твой прогресс</Text>
            </View>
            <TouchableOpacity
              style={styles.iconHeaderButton}
              onPress={() => router.push("/bans")}
            >
              <Ionicons name="ban-outline" size={22} color="#A0A0A0" />
            </TouchableOpacity>
          </View>

          <View style={styles.rankBadge}>
            <Ionicons
              name="star"
              size={14}
              color="#121212"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.rankText}>{userRank}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_workouts}</Text>
            <Text style={styles.statLabel}>Тренировок</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_minutes}</Text>
            <Text style={styles.statLabel}>Минут</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          <TouchableOpacity onPress={() => router.push("/achievements")}>
            <Text style={styles.achievementsCount}>
              {achievements.length} получено
            </Text>
          </TouchableOpacity>
        </View>

        {achievements.length === 0 ? (
          <Text style={{ color: "#666666", marginBottom: 30, fontSize: 14 }}>
            У тебя пока нет достижений. Время начать первую тренировку!
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.achievementsScroll}
          >
            {achievements.map((item: any, index: number) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementTitle}>{item.title}</Text>
                <Text style={styles.achievementDesc}>{item.desc}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setResetModalVisible(true)}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color="#A0D2EB"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.secondaryButtonText}>
            Изменить план тренировок
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomPanel}>
        <Text style={styles.trackerTitle}>Активность на этой неделе</Text>
        <View style={styles.weekTracker}>
          {weekDays.map((day) => (
            <View key={day.id} style={styles.dayColumn}>
              <View
                style={[styles.dayCircle, day.active && styles.dayCircleActive]}
              >
                {day.active && <Text style={styles.activeCheck}>✓</Text>}
              </View>
              <Text style={styles.dayLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
        >
          <Text style={styles.startButtonText}>🔥 Начать тренировку</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={resetModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.warningIcon}>
              <Ionicons name="alert-circle" size={40} color="#A0D2EB" />
            </View>
            <Text style={styles.modalTitle}>Изменить план?</Text>
            <Text style={styles.modalSubtitle}>
              Вы перейдете к анкете нового пользователя. Ваши достижения и
              история тренировок сохранятся.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.mButton, styles.mButtonCancel]}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.mButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mButton, styles.mButtonConfirm]}
                onPress={handleResetPlan}
              >
                <Text style={styles.mButtonTextDark}>Да, изменить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 220 },
  headerContainer: { marginBottom: 30 },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#A0D2EB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  rankText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "capitalize",
  },
  greeting: { fontSize: 16, color: "#A0A0A0" },
  title: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#27272A",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    alignItems: "center",
  },
  statValue: { fontSize: 36, fontWeight: "bold", color: "#B9E2F5" },
  statLabel: { fontSize: 14, color: "#A0A0A0" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  achievementsCount: { fontSize: 14, color: "#A0D2EB" },
  achievementsScroll: { marginBottom: 30 },
  achievementCard: {
    backgroundColor: "#27272A",
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    width: 160,
    borderLeftWidth: 3,
    borderLeftColor: "#A0D2EB",
  },
  achievementTitle: { fontSize: 15, fontWeight: "bold", color: "#FFFFFF" },
  achievementDesc: { fontSize: 11, color: "#A0A0A0" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3F3F46",
    backgroundColor: "#18181B",
  },
  secondaryButtonText: { color: "#A0D2EB", fontWeight: "600", fontSize: 14 },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#18181B",
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "#27272A",
  },
  trackerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  weekTracker: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  dayColumn: { alignItems: "center" },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dayCircleActive: { backgroundColor: "#A0D2EB", borderColor: "#A0D2EB" },
  activeCheck: { color: "#121212", fontWeight: "bold", fontSize: 18 },
  dayLabel: { color: "#A0A0A0", fontSize: 12 },
  startButton: {
    backgroundColor: "#A0D2EB",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  startButtonText: { color: "#121212", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#27272A",
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
  },
  warningIcon: { marginBottom: 15 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  mButton: { flex: 1, padding: 15, borderRadius: 12, alignItems: "center" },
  mButtonCancel: { backgroundColor: "#3F3F46" },
  mButtonConfirm: { backgroundColor: "#A0D2EB" },
  mButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  mButtonTextDark: { color: "#121212", fontWeight: "bold" },
});
