import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ВПИШИ СВОЙ IP-АДРЕС СЮДА ТОЛЬКО ОДИН РАЗ:
const SERVER_URL = "http://192.168.100.13:8000";

export default function BannedExercisesScreen() {
  const router = useRouter();
  const [bannedExercises, setBannedExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const deviceId = "test_user_001"; // Наш тестовый ID

  const fetchBans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/api/v1/users/${deviceId}/bans`,
      );
      const data = await response.json();

      if (response.ok && data.bans) {
        setBannedExercises(data.bans);
      }
    } catch (error) {
      console.error("Ошибка загрузки бан-листа:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Этот хук автоматически обновляет данные при каждом заходе на страницу
  useFocusEffect(
    useCallback(() => {
      fetchBans();
    }, []),
  );

  const handleUnban = async (id: any, name: string) => {
    try {
      const response = await fetch(
        `${SERVER_URL}/api/v1/users/${deviceId}/bans`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercise_name: name }),
        },
      );

      if (response.ok) {
        // Удаляем упражнение из списка ТОЛЬКО после успешного ответа сервера
        setBannedExercises((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Ошибка сервера: не удалось разблокировать.");
      }
    } catch (error) {
      alert("Ошибка сети при разблокировке. Проверь IP-адрес!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#A0D2EB" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Бан-лист</Text>
          <Text style={styles.headerSubtitle}>Исключено из твоего плана</Text>
        </View>
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
          <View style={styles.infoBox}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color="#A0D2EB"
              style={{ marginRight: 15 }}
            />
            <Text style={styles.infoText}>
              Твой ИИ-тренер автоматически добавляет сюда упражнения, если
              замечает жалобы в отзывах. Ты можешь вернуть их в любой момент.
            </Text>
          </View>

          {bannedExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle-outline"
                size={60}
                color="#3F3F46"
              />
              <Text style={styles.emptyStateTitle}>Всё чисто</Text>
              <Text style={styles.emptyStateText}>
                У тебя нет заблокированных упражнений. ИИ использует полный
                арсенал для твоих тренировок.
              </Text>
            </View>
          ) : (
            bannedExercises.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                </View>

                <TouchableOpacity
                  style={styles.unbanButton}
                  onPress={() => handleUnban(item.id, item.name)}
                >
                  <Ionicons name="refresh-outline" size={20} color="#121212" />
                  <Text style={styles.unbanButtonText}>Вернуть</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  backButton: { marginRight: 15, padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 13, color: "#A0A0A0", marginTop: 2 },
  scrollContent: { padding: 20 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(160, 210, 235, 0.1)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(160, 210, 235, 0.2)",
  },
  infoText: { flex: 1, color: "#A0D2EB", fontSize: 13, lineHeight: 18 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  cardInfo: { flex: 1, paddingRight: 15, justifyContent: "center" },
  exerciseName: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  unbanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A0D2EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  unbanButtonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
