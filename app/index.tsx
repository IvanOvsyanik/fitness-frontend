import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("Масса");
  const [equipment, setEquipment] = useState("Свой вес");

  const [isChecking, setIsChecking] = useState(true);

  const goals = ["Масса", "Рельеф", "Тонус"];
  const equipments = ["Свой вес", "Спортзал", "Гантели и турник"];

  // Проверяем память телефона при запуске
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem("hasOnboarded");
        if (value === "true") {
          // Если уже регался - мгновенно кидаем на дашборд
          router.replace("/dashboard");
        } else {
          // Иначе показываем экран анкеты
          setIsChecking(false);
        }
      } catch (e) {
        setIsChecking(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  const handleStart = async () => {
    const payload = {
      device_id: "test_user_001",
      goal: goal,
      weight: parseInt(weight) || 0,
      height: parseInt(height) || 0,
      age: parseInt(age) || 0,
      experience: experience,
      equipment: equipment,
    };

    try {
      // ВНИМАНИЕ: Впиши свой IP!
      const response = await fetch(
        "http://192.168.100.13:8000/api/v1/users/onboarding",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Успех! Записываем в память телефона, что юзер прошел анкету
        await AsyncStorage.setItem("hasOnboarded", "true");
        router.replace("/dashboard");
      } else {
        alert("Ошибка сервера: " + JSON.stringify(data));
      }
    } catch (error) {
      alert("Ошибка сети. Проверь IP-адрес и запущен ли сервер.");
      console.error(error);
    }
  };

  // Пока проверяем память, показываем лоадер, чтобы экран не "мигал"
  if (isChecking) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Создать профиль</Text>
        <Text style={styles.subtitle}>
          Эти данные нужны ИИ для подбора тренировок
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 85"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 185"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        <Text style={styles.label}>Возраст</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 25"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Твой опыт</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Например: занимался 2 года в зале, потом забросил из-за травмы плеча..."
          placeholderTextColor="#666666"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={experience}
          onChangeText={setExperience}
        />

        <Text style={styles.label}>Твоя цель</Text>
        <View style={styles.chipsContainer}>
          {goals.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, goal === item && styles.chipSelected]}
              onPress={() => setGoal(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  goal === item && styles.chipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Инвентарь</Text>
        <View style={styles.chipsContainer}>
          {equipments.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, equipment === item && styles.chipSelected]}
              onPress={() => setEquipment(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  equipment === item && styles.chipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Продолжить</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerContainer: { marginBottom: 30 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: "#A0A0A0" },
  card: {
    backgroundColor: "#27272A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  label: { fontSize: 14, color: "#B9E2F5", marginBottom: 8, fontWeight: "500" },
  input: {
    backgroundColor: "#121212",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  textArea: {
    backgroundColor: "#121212",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    height: 100,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333333",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#121212",
  },
  chipSelected: { backgroundColor: "#A0D2EB", borderColor: "#A0D2EB" },
  chipText: { color: "#A0A0A0", fontSize: 14, fontWeight: "500" },
  chipTextSelected: { color: "#121212", fontWeight: "bold" },
  button: {
    backgroundColor: "#A0D2EB",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  buttonText: { color: "#121212", fontSize: 16, fontWeight: "bold" },
});
