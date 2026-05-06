import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PostWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const totalExercises = params.totalExercises || 0;
  const duration = params.duration || 0;

  const [feedback, setFeedback] = useState("");
  const [difficulty, setDifficulty] = useState("Нормально");
  const [isLoading, setIsLoading] = useState(false);

  const difficulties = ["Легко", "Нормально", "Тяжело"];

  const handleFinish = async () => {
    const workoutId = params.workoutId;
    if (!workoutId) {
      router.replace("/dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        feedback_text: `Общая оценка сложности: ${difficulty}. Комментарий: ${feedback || "Без комментариев"}`,
      };
      const response = await fetch(
        `http://192.168.100.13:8000/api/v1/workout/${workoutId}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (response.ok) {
        router.replace("/dashboard");
      }
    } catch (e) {
      alert("Ошибка сети.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={50} color="#121212" />
          </View>
          <Text style={styles.title}>Отличная работа!</Text>
          <Text style={styles.subtitle}>Тренировка успешно завершена</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{duration}</Text>
            <Text style={styles.statLabel}>Минут</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalExercises}</Text>
            <Text style={styles.statLabel}>Упражнений</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Как тебе нагрузка?</Text>
          <View style={styles.chipsRow}>
            {difficulties.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, difficulty === level && styles.chipActive]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.chipText,
                    difficulty === level && styles.chipTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Расскажи подробнее</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Например: было тяжело на отжиманиях..."
            placeholderTextColor="#666666"
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.finishButtonText}>Сохранить прогресс</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { padding: 20, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 35 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#A0D2EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#A0A0A0" },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#27272A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B9E2F5",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#A0A0A0", textTransform: "uppercase" },
  statDivider: { width: 1, backgroundColor: "#3F3F46", marginHorizontal: 10 },
  section: { marginBottom: 30 },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  chipsRow: { flexDirection: "row", justifyContent: "space-between" },
  chip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    alignItems: "center",
    marginHorizontal: 4,
  },
  chipActive: { backgroundColor: "#A0D2EB", borderColor: "#A0D2EB" },
  chipText: { color: "#A0A0A0", fontSize: 14, fontWeight: "bold" },
  chipTextActive: { color: "#121212" },
  textArea: {
    backgroundColor: "#27272A",
    color: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    fontSize: 16,
    height: 120,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  footer: { padding: 20, paddingBottom: 40, backgroundColor: "#121212" },
  finishButton: {
    backgroundColor: "#A0D2EB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  finishButtonText: { color: "#121212", fontSize: 18, fontWeight: "bold" },
});
