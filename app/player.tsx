import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// НОВОЕ: Словарь анимаций.
// Сюда нужно будет добавить все твои гифки/картинки, когда они появятся.
const ANIMATIONS: Record<string, any> = {
  cool_child_pose: require("../assets/animations/cool_child_pose.mp4"), // Замени на .png или .jpg если нужно
  // "cool_chest_wall": require("../assets/animations/cool_chest_wall.gif"),
  // "push_ups": require("../assets/animations/push_ups.gif"),
};

export default function WorkoutPlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isResting, setIsResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45);

  const [currentEx, setCurrentEx] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);

  const [exercises, setExercises] = useState<any[]>([]);
  const [totalEx, setTotalEx] = useState(1);
  const [workoutDuration, setWorkoutDuration] = useState(0);

  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [skipDirection, setSkipDirection] = useState("forward");

  useEffect(() => {
    if (params.plan) {
      try {
        const planString = Array.isArray(params.plan)
          ? params.plan[0]
          : params.plan;
        const parsed = JSON.parse(planString);

        if (parsed.phases) {
          const flatExercises = [
            ...(parsed.phases.warmup || []),
            ...(parsed.phases.main || []),
            ...(parsed.phases.cooldown || []),
          ];

          if (flatExercises.length > 0) {
            setExercises(flatExercises);
            setTotalEx(flatExercises.length);
            setWorkoutDuration(parsed.estimated_minutes || 0);
            setSecondsLeft(flatExercises[0].work_sec_per_set || 45);
          }
        }
      } catch (e) {
        console.error("Ошибка парсинга плана", e);
      }
    }
  }, [params.plan]);

  const currentExerciseData = exercises[currentEx - 1] || {};
  const exerciseName = currentExerciseData.name || "Упражнение";
  const exerciseDesc =
    currentExerciseData.description ||
    `Целевые мышцы: ${(currentExerciseData.muscle_group || []).join(", ")}`;
  const nextExerciseName = exercises[currentEx]
    ? exercises[currentEx].name
    : "Конец тренировки";

  // Достаем anim_id из текущего упражнения
  const currentAnimId = currentExerciseData.anim_id;

  const totalSets = currentExerciseData.sets || 1;
  const exerciseTime = currentExerciseData.work_sec_per_set || 45;
  const restTime = currentExerciseData.rest_sec_between_sets || 30;

  const finishWorkout = () => {
    router.replace({
      pathname: "/post-workout",
      params: {
        workoutId: params.workoutId,
        totalExercises: totalEx,
        duration: workoutDuration,
      },
    });
  };

  const openModal = (setter: any, extraAction: any = null) => {
    setIsPlaying(false);
    setter(true);
    if (extraAction) extraAction();
  };

  const closeModal = (setter: any) => {
    setter(false);
    setIsPlaying(true);
  };

  const rewindTime = () => setSecondsLeft((prev) => prev + 10);
  const fastForwardTime = () =>
    setSecondsLeft((prev) => (prev <= 10 ? 0 : prev - 10));

  const handleSkip = () => {
    setSkipModalVisible(false);
    setIsPlaying(true);
    setIsResting(false);

    if (skipDirection === "forward") {
      if (currentEx < totalEx) {
        const nextEx = exercises[currentEx];
        setSecondsLeft(nextEx.work_sec_per_set || 45);
        setCurrentEx((prev) => prev + 1);
        setCurrentSet(1);
      } else {
        finishWorkout();
      }
    } else if (skipDirection === "back") {
      if (currentEx > 1) {
        const prevEx = exercises[currentEx - 2];
        setSecondsLeft(prevEx.work_sec_per_set || 45);
        setCurrentEx((prev) => prev - 1);
        setCurrentSet(1);
      } else {
        setSecondsLeft(exercises[0].work_sec_per_set || 45);
        setCurrentSet(1);
      }
    }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying && secondsLeft > 0) {
      timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0 && isPlaying) {
      if (!isResting) {
        if (currentSet < totalSets) {
          if (restTime > 0) {
            setIsResting(true);
            setSecondsLeft(restTime);
          } else {
            setCurrentSet((prev) => prev + 1);
            setSecondsLeft(exerciseTime);
          }
        } else {
          if (currentEx < totalEx) {
            if (restTime > 0) {
              setIsResting(true);
              setSecondsLeft(restTime);
            } else {
              setCurrentEx((prev) => prev + 1);
              setCurrentSet(1);
              setSecondsLeft(exercises[currentEx].work_sec_per_set || 45);
            }
          } else {
            setIsPlaying(false);
            finishWorkout();
          }
        }
      } else {
        setIsResting(false);
        if (currentSet < totalSets) {
          setCurrentSet((prev) => prev + 1);
          setSecondsLeft(exerciseTime);
        } else {
          setCurrentEx((prev) => prev + 1);
          setCurrentSet(1);
          setSecondsLeft(exercises[currentEx].work_sec_per_set || 45);
        }
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, secondsLeft, isResting, currentEx, currentSet]);

  return (
    <View style={styles.container}>
      <View style={[styles.videoPlaceholder, isResting && styles.videoResting]}>
        {isResting ? (
          <View style={styles.restOverlay}>
            <Text style={styles.restBigText}>ОТДЫХ</Text>
            <Text style={styles.restSubText}>
              {currentSet < totalSets
                ? `Перед ${currentSet + 1} подходом`
                : "Перед новым упражнением"}
            </Text>
            <Ionicons
              name="cafe-outline"
              size={60}
              color="#A0D2EB"
              style={{ marginTop: 20 }}
            />
          </View>
        ) : // НОВОЕ: Проверяем, есть ли анимация в словаре
        currentAnimId && ANIMATIONS[currentAnimId] ? (
          <Video
            source={ANIMATIONS[currentAnimId]}
            style={styles.animationImage}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isPlaying}
            isLooping={true}
            isMuted={true}
          />
        ) : (
          // Если анимации нет — показываем старую иконку-заглушку
          <Ionicons name="fitness-outline" size={100} color="#27272A" />
        )}

        <TouchableOpacity
          style={styles.navButtonLeft}
          onPress={() =>
            openModal(setSkipModalVisible, () => setSkipDirection("back"))
          }
        >
          <Ionicons
            name="chevron-back"
            size={40}
            color="rgba(255,255,255,0.4)"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButtonRight}
          onPress={() =>
            openModal(setSkipModalVisible, () => setSkipDirection("forward"))
          }
        >
          <Ionicons
            name="chevron-forward"
            size={40}
            color="rgba(255,255,255,0.4)"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.topOverlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => openModal(setExitModalVisible)}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Упражнение {currentEx} из {totalEx}
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(currentEx / totalEx) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(18,18,18,0.9)", "#121212"]}
        style={styles.bottomOverlay}
      >
        <TouchableOpacity onPress={() => openModal(setInfoModalVisible)}>
          <Text style={styles.exerciseTitle}>
            {exerciseName}{" "}
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#A0D2EB"
            />
          </Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="repeat" size={14} color="#A0D2EB" />
            <Text style={styles.statText}>
              Подход {currentSet}/{totalSets}
            </Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="timer-outline" size={14} color="#A0D2EB" />
            <Text style={styles.statText}>{exerciseTime} сек</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="cafe-outline" size={14} color="#A0D2EB" />
            <Text style={styles.statText}>{restTime} сек</Text>
          </View>
        </View>

        <Text style={styles.nextExercise}>Далее: {nextExerciseName}</Text>

        <View style={styles.timerContainer}>
          <View
            style={[styles.timerCircle, isResting && styles.timerCircleRest]}
          >
            <Text style={styles.timerValue}>{secondsLeft}</Text>
            <Text style={[styles.timerUnit, isResting && { color: "#FFFFFF" }]}>
              сек
            </Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.sideButton} onPress={rewindTime}>
            <Ionicons name="play-back" size={32} color="#FFFFFF" />
            <Text style={styles.timeControlText}>+10s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mainPlayButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="#121212"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton} onPress={fastForwardTime}>
            <Ionicons name="play-forward" size={32} color="#FFFFFF" />
            <Text style={styles.timeControlText}>-10s</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal transparent visible={exitModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Прервать тренировку?</Text>
            <Text style={styles.modalSubtitle}>
              Прогресс не будет сохранен.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.mButton, styles.mButtonCancel]}
                onPress={() => closeModal(setExitModalVisible)}
              >
                <Text style={styles.mButtonText}>Продолжить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mButton, styles.mButtonExit]}
                onPress={() => {
                  setExitModalVisible(false);
                  finishWorkout();
                }}
              >
                <Text style={styles.mButtonTextDark}>Выйти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={skipModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Пропустить?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.mButton, styles.mButtonCancel]}
                onPress={() => closeModal(setSkipModalVisible)}
              >
                <Text style={styles.mButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mButton, styles.mButtonConfirm]}
                onPress={handleSkip}
              >
                <Text style={styles.mButtonTextDark}>Да</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={infoModalVisible} animationType="slide">
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoHandle} />
            <Text style={styles.infoTitle}>Техника</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.infoText}>{exerciseDesc}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.infoCloseButton}
              onPress={() => closeModal(setInfoModalVisible)}
            >
              <Text style={styles.infoCloseText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoPlaceholder: {
    width,
    height,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
  videoResting: { backgroundColor: "#121212" },

  // НОВОЕ: Стили для гифки/картинки
  animationImage: { width: "100%", height: "100%", opacity: 0.8 },

  restOverlay: { alignItems: "center" },
  restBigText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#A0D2EB",
    letterSpacing: 3,
  },
  restSubText: {
    fontSize: 16,
    color: "#A0A0A0",
    marginTop: 5,
    fontWeight: "500",
  },
  navButtonLeft: {
    position: "absolute",
    left: 10,
    top: "40%",
    padding: 15,
    zIndex: 10,
  },
  navButtonRight: {
    position: "absolute",
    right: 10,
    top: "40%",
    padding: 15,
    zIndex: 10,
  },
  topOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: { flex: 1, marginLeft: 20 },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A0D2EB",
    borderRadius: 2,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    paddingBottom: 50,
    alignItems: "center",
    zIndex: 20,
  },
  exerciseTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 15,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(160, 210, 235, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(160, 210, 235, 0.2)",
  },
  statText: {
    color: "#A0D2EB",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  nextExercise: { fontSize: 15, color: "#808080", marginBottom: 25 },
  timerContainer: { marginBottom: 35 },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#A0D2EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  timerCircleRest: { borderColor: "#FFFFFF" },
  timerValue: { fontSize: 48, fontWeight: "bold", color: "#FFFFFF" },
  timerUnit: {
    fontSize: 14,
    color: "#A0D2EB",
    fontWeight: "bold",
    marginTop: -5,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  mainPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#A0D2EB",
    justifyContent: "center",
    alignItems: "center",
  },
  sideButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  timeControlText: {
    color: "#A0A0A0",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
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
  },
  modalButtons: { flexDirection: "row", gap: 15 },
  mButton: { flex: 1, padding: 15, borderRadius: 12, alignItems: "center" },
  mButtonCancel: { backgroundColor: "#3F3F46" },
  mButtonExit: { backgroundColor: "#FF4444" },
  mButtonConfirm: { backgroundColor: "#A0D2EB" },
  mButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  mButtonTextDark: { color: "#121212", fontWeight: "bold" },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  infoModalContent: {
    height: "60%",
    backgroundColor: "#18181B",
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  infoHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#3F3F46",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  infoText: { fontSize: 16, color: "#A0A0A0", lineHeight: 26 },
  infoCloseButton: {
    backgroundColor: "#A0D2EB",
    padding: 18,
    borderRadius: 16,
    marginTop: 30,
    alignItems: "center",
  },
  infoCloseText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
});
