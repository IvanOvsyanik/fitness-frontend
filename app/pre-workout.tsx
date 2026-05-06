import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PreWorkoutScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState(30);
  const [condition, setCondition] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [choiceModalVisible, setChoiceModalVisible] = useState(false);
  // ИСПРАВЛЕНО: Указан тип any
  const [choiceData, setChoiceData] = useState<any>(null);

  const durations = [15, 30, 45, 60, 75, 90];

  // ИСПРАВЛЕНО: Типизирован аргумент fallback
  const handleGenerate = async (fallback: any = null) => {
    setIsLoading(true);
    if (fallback) setChoiceModalVisible(false);

    try {
      const payload = {
        device_id: "test_user_001",
        pre_workout_text: condition || "",
        target_time_minutes: duration,
        fallback_choice: fallback,
      };

      // НЕ ЗАБУДЬ ЗАМЕНИТЬ IP
      const response = await fetch(
        "http://192.168.100.13:8000/api/v1/workout/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert("Ошибка сервера: " + JSON.stringify(data));
        setIsLoading(false);
        return;
      }

      if (data.status === "choice_required") {
        setChoiceData(data);
        setChoiceModalVisible(true);
        setIsLoading(false);
      } else if (data.status === "success") {
        setIsLoading(false);

        router.push({
          pathname: "/player",
          params: {
            workoutId: data.workout_id,
            plan: JSON.stringify(data.workout),
          },
        });
      }
    } catch (error) {
      alert("Ошибка сети. Проверь IP-адрес и сервер.");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#A0D2EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройка сессии</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Длительность (минуты)</Text>
          <View style={styles.chipsGrid}>
            {durations.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.chip, duration === time && styles.chipActive]}
                onPress={() => setDuration(time)}
              >
                <Text
                  style={[
                    styles.chipText,
                    duration === time && styles.chipTextActive,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Помоги ИИ составить тренировку
          </Text>
          <Text style={styles.sectionSubtitle}>
            Опиши своё самочувствие, уровень энергии или наличие крепатуры.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Например: сегодня мало энергии, или немного тянет поясницу..."
            placeholderTextColor="#666666"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={condition}
            onChangeText={setCondition}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="sparkles"
            size={20}
            color="#A0D2EB"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.infoText}>
            Твой персональный ИИ проанализирует текст и составит лучшую
            тренировку специально для тебя.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => handleGenerate(null)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.generateButtonText}>Сгенерировать план</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal transparent visible={choiceModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="warning-outline"
              size={40}
              color="#FF6B6B"
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.modalTitle}>Внимание</Text>
            <Text style={styles.modalSubtitle}>{choiceData?.message}</Text>
            <View style={{ width: "100%", gap: 10 }}>
              {choiceData?.options?.map((opt: any) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.mButtonConfirm}
                  onPress={() => handleGenerate(opt.id)}
                >
                  <Text style={styles.mButtonTextDark}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.mButtonCancel}
                onPress={() => setChoiceModalVisible(false)}
              >
                <Text style={styles.mButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 15,
  },
  scrollContent: { padding: 20 },
  section: { marginBottom: 35 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B9E2F5",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 15,
    lineHeight: 20,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  chip: {
    width: "31%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    alignItems: "center",
  },
  chipActive: { backgroundColor: "#A0D2EB", borderColor: "#A0D2EB" },
  chipText: { color: "#A0A0A0", fontSize: 16, fontWeight: "bold" },
  chipTextActive: { color: "#121212" },
  textArea: {
    backgroundColor: "#27272A",
    color: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    fontSize: 16,
    height: 140,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(160, 210, 235, 0.1)",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  infoText: { flex: 1, color: "#A0D2EB", fontSize: 13, lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 40, backgroundColor: "#121212" },
  generateButton: {
    backgroundColor: "#A0D2EB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  generateButtonText: { color: "#121212", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#27272A",
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  mButtonConfirm: {
    backgroundColor: "#A0D2EB",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  mButtonCancel: {
    backgroundColor: "#3F3F46",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  mButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  mButtonTextDark: { color: "#121212", fontWeight: "bold" },
});
