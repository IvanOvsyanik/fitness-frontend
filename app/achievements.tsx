import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// База всех достижений для интерфейса
const MASTER_ACHIEVEMENTS = [
  {
    id: "first_workout",
    title: "Первый шаг 🥉",
    desc: "Завершена первая тренировка",
    icon: "trophy",
  },
  {
    id: "perfect_week",
    title: "Дисциплина 🏅",
    desc: "Завершено 3 тренировки",
    icon: "calendar",
  },
  {
    id: "marathon_50",
    title: "Марафонец 🥈",
    desc: "Суммарно 50 минут тренировок",
    icon: "stopwatch",
  },
  {
    id: "marathon_100",
    title: "Железный человек 🥇",
    desc: "Суммарно 100 минут тренировок",
    icon: "fitness",
  },
];

export default function AchievementsScreen() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earnedCount, setEarnedCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ВНИМАНИЕ: Замени 192.168.X.X на свой IP!
        const response = await fetch(
          "http://192.168.100.13:8000/api/v1/users/test_user_001/stats",
        );
        const data = await response.json();

        if (response.ok && data.stats) {
          const userAchievements = data.stats.achievements || [];
          setEarnedCount(userAchievements.length);

          // Сливаем мастер-базу с прогрессом пользователя
          const merged = MASTER_ACHIEVEMENTS.map((masterAch) => {
            // Ищем, есть ли эта ачивка у пользователя по названию (т.к. бэкенд возвращает title)
            const earnedInfo = userAchievements.find(
              (ua: any) => ua.title === masterAch.title,
            );
            return {
              ...masterAch,
              earned: !!earnedInfo,
              date: earnedInfo
                ? new Date(earnedInfo.date).toLocaleDateString("ru-RU")
                : null,
            };
          });

          setAchievements(merged);
        }
      } catch (error) {
        console.error("Ошибка загрузки достижений:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#A0D2EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Все достижения</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#A0D2EB"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsSummary}>
            <Text style={styles.summaryText}>
              Открыто <Text style={styles.highlightText}>{earnedCount}</Text> из{" "}
              <Text style={styles.highlightText}>
                {MASTER_ACHIEVEMENTS.length}
              </Text>
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(earnedCount / MASTER_ACHIEVEMENTS.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {achievements.map((item) => (
            <View
              key={item.id}
              style={[styles.card, !item.earned && styles.cardLocked]}
            >
              <View
                style={[
                  styles.iconBox,
                  item.earned ? styles.iconBoxEarned : styles.iconBoxLocked,
                ]}
              >
                <Ionicons
                  name={item.earned ? (item.icon as any) : "lock-closed"}
                  size={28}
                  color={item.earned ? "#121212" : "#666666"}
                />
              </View>

              <View style={styles.infoBox}>
                <Text
                  style={[styles.achTitle, !item.earned && styles.textLocked]}
                >
                  {item.title}
                </Text>
                <Text style={styles.achDesc}>{item.desc}</Text>
                {item.earned && (
                  <Text style={styles.earnedDate}>Получено: {item.date}</Text>
                )}
              </View>

              {item.earned && (
                <Ionicons name="checkmark-circle" size={24} color="#A0D2EB" />
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#18181B",
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  scrollContent: { padding: 20 },
  statsSummary: { marginBottom: 30, alignItems: "center" },
  summaryText: { color: "#A0A0A0", fontSize: 16, marginBottom: 10 },
  highlightText: { color: "#A0D2EB", fontWeight: "bold" },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#27272A",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#A0D2EB" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  cardLocked: { opacity: 0.5, borderColor: "transparent" },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconBoxEarned: { backgroundColor: "#A0D2EB" },
  iconBoxLocked: { backgroundColor: "#18181B" },
  infoBox: { flex: 1 },
  achTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  textLocked: { color: "#A0A0A0" },
  achDesc: { fontSize: 13, color: "#A0A0A0", marginBottom: 4 },
  earnedDate: { fontSize: 11, color: "#B9E2F5", fontWeight: "500" },
  textIceBlue: { color: "#B9E2F5" },
});
