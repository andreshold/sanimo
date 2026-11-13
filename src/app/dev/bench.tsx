/**
 * Banc d'essai IA (écran caché, mode dev) — outil pour D2.
 *
 * Copier les modèles sur le téléphone, dans le dossier privé de l'app (aucune permission requise) :
 *   adb shell mkdir -p /sdcard/Android/data/ht.sanimo.app/files/models
 *   adb push oswald.gguf oswald-mmproj.gguf makandal.gguf test.wav /sdcard/Android/data/ht.sanimo.app/files/models/
 *
 * Mesure : temps de chargement, vitesse de génération, transcription audio (Oswald), chargement ONNX (Fatiman).
 */
import * as Device from 'expo-device';
import { initLlama, type LlamaContext } from 'llama.rn';
import { InferenceSession } from 'onnxruntime-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, touch, typography } from '@/ui/theme';

const DIR = '/sdcard/Android/data/ht.sanimo.app/files/models';

const now = () => Date.now();

export default function BenchScreen() {
  const [modelPath, setModelPath] = useState(`${DIR}/makandal.gguf`);
  const [mmprojPath, setMmprojPath] = useState(`${DIR}/oswald-mmproj.gguf`);
  const [audioPath, setAudioPath] = useState(`${DIR}/test.wav`);
  const [prompt, setPrompt] = useState('Chen mwen an ap vomi depi ayè, li pa vle manje.');
  const [onnxPath, setOnnxPath] = useState(`${DIR}/fatiman.onnx`);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([
    `Appareil : ${Device.manufacturer ?? '?'} ${Device.modelName ?? '?'} · RAM ${
      Device.totalMemory ? (Device.totalMemory / 1024 ** 3).toFixed(1) : '?'
    } Go`,
  ]);
  const ctx = useRef<LlamaContext | null>(null);

  const write = (line: string) => setLog((l) => [...l, line]);

  const run = async (label: string, fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    write(`▶ ${label}`);
    try {
      await fn();
    } catch (e) {
      write(`✖ ${label} : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const loadLlm = () =>
    run('Charger le GGUF', async () => {
      await ctx.current?.release();
      const t = now();
      ctx.current = await initLlama({ model: modelPath, n_ctx: 2048, n_gpu_layers: 0, ctx_shift: false });
      write(`✔ chargé en ${now() - t} ms`);
    });

  const textTest = () =>
    run('Complétion texte', async () => {
      if (!ctx.current) throw new Error('aucun modèle chargé');
      const t = now();
      const r = await ctx.current.completion({
        messages: [{ role: 'user', content: prompt }],
        n_predict: 128,
        temperature: 0.2,
      });
      write(`✔ ${now() - t} ms · ${r.timings.predicted_per_second.toFixed(1)} tok/s`);
      write(r.text.trim());
    });

  const audioTest = () =>
    run('Transcription audio (mmproj)', async () => {
      if (!ctx.current) throw new Error('charger d’abord le GGUF d’Oswald');
      const t0 = now();
      const ok = await ctx.current.initMultimodal({ path: mmprojPath, use_gpu: false });
      const support = await ctx.current.getMultimodalSupport();
      write(`mmproj ${ok ? 'OK' : 'KO'} en ${now() - t0} ms · audio=${support.audio}`);
      if (!ok || !support.audio) return;
      const t1 = now();
      const r = await ctx.current.completion({
        messages: [
          {
            role: 'user',
            content: [{ type: 'input_audio', input_audio: { url: `file://${audioPath}`, format: 'wav' } }],
          },
        ],
        n_predict: 200,
        temperature: 0,
      });
      write(`✔ transcrit en ${now() - t1} ms`);
      write(r.text.trim());
    });

  const onnxTest = () =>
    run('Charger ONNX', async () => {
      const t = now();
      const s = await InferenceSession.create(onnxPath);
      write(`✔ ONNX chargé en ${now() - t} ms · entrées ${s.inputNames.join(', ')} · sorties ${s.outputNames.join(', ')}`);
      await s.release();
    });

  const release = () =>
    run('Libérer', async () => {
      await ctx.current?.release();
      ctx.current = null;
      write('✔ mémoire libérée');
    });

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Field label="GGUF (Makandal ou Oswald)" value={modelPath} onChange={setModelPath} />
      <Field label="Projecteur audio d’Oswald (mmproj)" value={mmprojPath} onChange={setMmprojPath} />
      <Field label="Fichier audio WAV 16 kHz" value={audioPath} onChange={setAudioPath} />
      <Field label="Texte à envoyer" value={prompt} onChange={setPrompt} multiline />
      <Field label="Modèle ONNX (Fatiman)" value={onnxPath} onChange={setOnnxPath} />

      <View style={styles.row}>
        <Btn label="Charger GGUF" onPress={loadLlm} disabled={busy} />
        <Btn label="Test texte" onPress={textTest} disabled={busy} />
        <Btn label="Test audio" onPress={audioTest} disabled={busy} />
        <Btn label="Test ONNX" onPress={onnxTest} disabled={busy} />
        <Btn label="Libérer" onPress={release} disabled={busy} />
      </View>

      <View style={styles.log}>
        {log.map((l, i) => (
          <Text key={i} style={styles.logLine} selectable>
            {l}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={typography.small}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChange}
        multiline={props.multiline}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

function Btn(props: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      disabled={props.disabled}
      style={({ pressed }) => [styles.btn, (pressed || props.disabled) && styles.btnDim]}
    >
      <Text style={[typography.button, styles.btnText]}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.lg, gap: spacing.md },
  field: { gap: spacing.xs },
  input: {
    ...typography.body,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  btn: {
    minHeight: touch.min,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  btnDim: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: 15 },
  log: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  logLine: { ...typography.small, color: colors.ink },
});
