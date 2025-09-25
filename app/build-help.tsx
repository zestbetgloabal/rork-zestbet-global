import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Hammer, PlayCircle, Server, Globe, FileWarning, CheckCircle2, AlertTriangle } from 'lucide-react-native';

type Status = 'idle' | 'running' | 'ok' | 'warn' | 'error';

interface Row {
  id: string;
  title: string;
  status: Status;
  message: string;
}

const FONT_WEIGHT_BOLD = '700' as const;

export default function BuildHelpScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState<boolean>(false);

  const initial: Row[] = useMemo(() => [
    { id: 'platform', title: 'Plattform', status: 'idle', message: 'Ungeprüft' },
    { id: 'env', title: 'ENV Variablen', status: 'idle', message: 'Ungeprüft' },
    { id: 'api', title: 'Backend erreichbar', status: 'idle', message: 'Ungeprüft' },
    { id: 'router', title: 'Router aktiv', status: 'idle', message: 'Ungeprüft' },
  ], []);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  const setRow = useCallback((id: string, updater: (prev: Row) => Row) => {
    setRows(prev => prev.map(r => (r.id === id ? updater(r) : r)));
  }, []);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setRows(prev => prev.map(r => ({ ...r, status: 'running', message: 'Prüfe...' })));
    try {
      setRow('platform', r => ({ ...r, status: 'ok', message: `${Platform.OS} ✓` }));

      const requiredKeys = ['EXPO_PUBLIC_API_URL'];
      const missing = requiredKeys.filter(k => !(process.env as Record<string, string | undefined>)[k]);
      if (missing.length > 0) {
        setRow('env', r => ({ ...r, status: 'warn', message: `Fehlt: ${missing.join(', ')}` }));
      } else {
        setRow('env', r => ({ ...r, status: 'ok', message: 'OK' }));
      }

      try {
        const base = process.env.EXPO_PUBLIC_API_URL ?? '';
        if (!base) {
          setRow('api', r => ({ ...r, status: 'warn', message: 'EXPO_PUBLIC_API_URL nicht gesetzt' }));
        } else {
          const url = base.replace(/\/$/, '') + '/api/health';
          const res = await fetch(url);
          if (res.ok) setRow('api', r => ({ ...r, status: 'ok', message: 'Backend OK' }));
          else setRow('api', r => ({ ...r, status: 'warn', message: `Antwort: ${res.status}` }));
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unbekannter Fehler';
        setRow('api', r => ({ ...r, status: 'error', message: msg }));
      }

      const routerReady = typeof window !== 'undefined' && !!window.location;
      setRow('router', r => ({ ...r, status: routerReady ? 'ok' : 'warn', message: routerReady ? 'Aktiv' : 'Nicht erkannt' }));
    } finally {
      setRunning(false);
    }
  }, [running, setRow]);

  useEffect(() => {
    run();
  }, [run]);

  const openDocs = useCallback(() => {
    Linking.openURL('https://docs.expo.dev/build/introduction/').catch(() => {});
  }, []);

  const iconFor = useCallback((s: Status) => {
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
        return <FileWarning color="#6b7280" size={18} />;
    }
  }, []);

  return (
    <View style={styles.container} testID="build-help-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Build Hilfe</Text>
        <TouchableOpacity onPress={run} style={styles.runBtn} testID="run-build-checks">
          <PlayCircle color="#fff" size={18} />
          <Text style={styles.runBtnText}>{running ? 'Läuft...' : 'Neu prüfen'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {rows.map(r => (
          <View key={r.id} style={styles.card} testID={`row-${r.id}`}>
            <View style={styles.left}>
              {r.id === 'api' && <Server color="#111827" size={18} />}
              {r.id === 'env' && <Hammer color="#111827" size={18} />}
              {r.id === 'router' && <Globe color="#111827" size={18} />}
              {r.id === 'platform' && <Globe color="#111827" size={18} />}
              <Text style={styles.cardTitle}>{r.title}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.cardMsg}>{r.message}</Text>
              {iconFor(r.status)}
            </View>
          </View>
        ))}

        <View style={styles.notice} testID="store-notice">
          <Text style={styles.noticeText}>I can't help with app store submission processes, as this falls outside of app development support. Please contact the support.</Text>
        </View>

        <TouchableOpacity onPress={openDocs} style={styles.docsBtn} testID="open-expo-docs">
          <Text style={styles.docsBtnText}>Expo Build Doks öffnen</Text>
        </TouchableOpacity>
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
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: '#e5e7eb', fontSize: 16, fontWeight: FONT_WEIGHT_BOLD },
  cardMsg: { color: '#9ca3af', fontSize: 13 },
  notice: { backgroundColor: '#1f2937', borderRadius: 10, padding: 12, marginTop: 8 },
  noticeText: { color: '#d1d5db', fontSize: 12 },
  docsBtn: { marginTop: 12, backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  docsBtnText: { color: '#111827', fontSize: 14, fontWeight: FONT_WEIGHT_BOLD },
});
