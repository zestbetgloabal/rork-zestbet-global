import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking, ActivityIndicator, ScrollView } from 'react-native';
import { CheckCircle2, AlertTriangle, Globe, Smartphone, Github, PlayCircle, Server } from 'lucide-react-native';

type CheckStatus = 'idle' | 'running' | 'ok' | 'warn' | 'error';

interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
}

const FONT_WEIGHT_BOLD = '700' as const;
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SystemCheckScreen() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  const initialChecks = useMemo<CheckResult[]>(() => [
    { id: 'platform', title: 'Plattform', status: 'idle', message: 'Ungeprüft' },
    { id: 'expo', title: 'Expo Start erreichbar', status: 'idle', message: 'Ungeprüft' },
    { id: 'router', title: 'Expo Router', status: 'idle', message: 'Ungeprüft' },
    { id: 'network', title: 'Internet Verbindung', status: 'idle', message: 'Ungeprüft' },
    { id: 'backend', title: 'Backend API erreichbar', status: 'idle', message: 'Ungeprüft' },
  ], []);

  useEffect(() => {
    setResults(initialChecks);
  }, [initialChecks]);

  const setCheck = useCallback((id: string, updater: (prev: CheckResult) => CheckResult) => {
    setResults(prev => prev.map(c => c.id === id ? updater(c) : c));
  }, []);

  const runChecks = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setResults(prev => prev.map(c => ({ ...c, status: 'running', message: 'Prüfe...' })));

    try {
      setCheck('platform', (c) => ({ ...c, status: 'ok', message: `${Platform.OS} ✓` }));

      const expoOk = typeof window !== 'undefined';
      setCheck('expo', (c) => ({ ...c, status: expoOk ? 'ok' : 'warn', message: expoOk ? 'Läuft in Dev-Server' : 'Kein Fenster-Kontext' }));

      const routerMounted = typeof window !== 'undefined' && !!window.location;
      setCheck('router', (c) => ({ ...c, status: routerMounted ? 'ok' : 'error', message: routerMounted ? 'Router aktiv' : 'Router nicht erkannt' }));

      try {
        const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
        setCheck('network', (c) => ({ ...c, status: online ? 'ok' : 'error', message: online ? 'Online' : 'Offline' }));
      } catch (_e) {
        setCheck('network', (c) => ({ ...c, status: 'warn', message: 'Netzwerkstatus unbekannt' }));
      }

      try {
        const base = process.env.EXPO_PUBLIC_API_URL ?? '';
        if (!base) {
          setCheck('backend', (c) => ({ ...c, status: 'warn', message: 'EXPO_PUBLIC_API_URL nicht gesetzt' }));
        } else {
          const url = base.replace(/\/$/, '') + '/api/health';
          const res = await fetch(url, { method: 'GET' });
          if (res.ok) {
            setCheck('backend', (c) => ({ ...c, status: 'ok', message: 'Backend OK' }));
          } else {
            setCheck('backend', (c) => ({ ...c, status: 'warn', message: `Backend Antwort: ${res.status}` }));
          }
        }
      } catch (_e: unknown) {
        const msg = _e instanceof Error ? _e.message : 'Unbekannter Fehler';
        setCheck('backend', (c) => ({ ...c, status: 'error', message: `Fehler: ${msg}` }));
      }
    } finally {
      setRunning(false);
    }
  }, [running, setCheck]);

  const onHowToRun = useCallback(() => {
    console.log('HOW_TO_RUN', 'npm i -> npm run start -> QR scannen oder Taste w für Web');
  }, []);

  const onGitHelp = useCallback(() => {
    const url = 'https://docs.github.com/de/repositories/working-with-files/managing-files/adding-a-file-to-a-repository-using-the-command-line';
    Linking.openURL(url).catch(() => {
      console.log('LINK_ERROR', 'Öffnen der GitHub-Hilfe nicht möglich.');
    });
  }, []);

  const statusIcon = useCallback((s: CheckStatus) => {
    switch (s) {
      case 'ok':
        return <CheckCircle2 color="#16a34a" size={18} />;
      case 'warn':
        return <AlertTriangle color="#f59e0b" size={18} />;
      case 'error':
        return <AlertTriangle color="#ef4444" size={18} />;
      case 'running':
        return <ActivityIndicator size="small" color="#6366f1" />;
      default:
        return <AlertTriangle color="#6b7280" size={18} />;
    }
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const safeContainerStyle = useMemo(() => ({
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  }), [insets.bottom, insets.top]);

  return (
    <View style={[styles.container, safeContainerStyle]} testID="system-check-screen">
      <View style={styles.header}>
        <Text style={styles.title}>System Check</Text>
        <TouchableOpacity onPress={runChecks} style={styles.runBtn} testID="run-checks-btn">
          <PlayCircle color="#fff" size={18} />
          <Text style={styles.runBtnText}>{running ? 'Läuft...' : 'Erneut prüfen'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {results.map((r) => (
          <View key={r.id} style={styles.card} testID={`check-${r.id}`}>
            <View style={styles.cardLeft}>
              {r.id === 'platform' && <Smartphone color="#111827" size={18} />}
              {r.id === 'expo' && <PlayCircle color="#111827" size={18} />}
              {r.id === 'router' && <Server color="#111827" size={18} />} 
              {r.id === 'network' && <Globe color="#111827" size={18} />}
              {r.id === 'backend' && <Server color="#111827" size={18} />}
              <Text style={styles.cardTitle}>{r.title}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardMsg}>{r.message}</Text>
              {statusIcon(r.status)}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schnellstart</Text>
          <TouchableOpacity onPress={onHowToRun} style={styles.actionBtn} testID="how-to-run-btn">
            <PlayCircle color="#111827" size={18} />
            <Text style={styles.actionBtnText}>Wie starte ich die App?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GitHub Push Hilfe</Text>
          <TouchableOpacity onPress={onGitHelp} style={styles.actionBtn} testID="github-help-btn">
            <Github color="#111827" size={18} />
            <Text style={styles.actionBtnText}>Einfacher Leitfaden öffnen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Hinweis: EAS Build/Submit wird hier nicht konfiguriert. Für lokale Entwicklung genügt &quot;npm run start&quot;.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 24, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: FONT_WEIGHT_BOLD },
  runBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  runBtnText: { color: '#fff', fontSize: 14, fontWeight: FONT_WEIGHT_BOLD },
  scroll: { padding: 16, gap: 12 },
  card: { backgroundColor: '#111827', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: FONT_WEIGHT_BOLD },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardMsg: { color: '#9ca3af', fontSize: 13 },
  section: { marginTop: 8, backgroundColor: '#0b1220', borderRadius: 12, padding: 14, gap: 10 },
  sectionTitle: { color: '#93c5fd', fontSize: 14, fontWeight: FONT_WEIGHT_BOLD },
  actionBtn: { backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtnText: { color: '#111827', fontSize: 14, fontWeight: FONT_WEIGHT_BOLD },
  note: { marginTop: 8, padding: 12, backgroundColor: '#1f2937', borderRadius: 10 },
  noteText: { color: '#d1d5db', fontSize: 12 },
});
