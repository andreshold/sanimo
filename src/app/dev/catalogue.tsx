/**
 * Catalogue des composants (écran caché, mode dev) : référence visuelle de la charte pour l'équipe.
 * Toute nouvelle variante de composant doit apparaître ici.
 */
import { Cat, Dog } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { resetSettings } from '@/storage/settings';
import {
  AppText,
  Banner,
  Button,
  Card,
  CheckRow,
  ChoiceCard,
  IjansButton,
  LevelBadge,
  ListenButton,
  ProgressSteps,
  Screen,
  colors,
  radius,
  spacing,
} from '@/ui';

const swatches = [
  { name: 'Bleu Sanimo', hex: colors.primary },
  { name: 'Émeraude', hex: colors.care },
  { name: 'Ambre', hex: colors.accent },
  { name: 'Brume', hex: colors.surface },
  { name: 'Encre', hex: colors.ink },
  { name: 'Urgence', hex: colors.danger },
];

export default function CatalogueScreen() {
  const [species, setSpecies] = useState<'chien' | 'chat'>('chien');
  const [checked, setChecked] = useState({ a: true, b: false });
  const [playing, setPlaying] = useState(false);

  return (
    <Screen>
      <Section title="Couleurs">
        <View style={styles.swatches}>
          {swatches.map((s) => (
            <View key={s.name} style={styles.swatch}>
              <View style={[styles.swatchColor, { backgroundColor: s.hex }]} />
              <AppText variant="caption">{s.name}</AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typographie">
        <AppText variant="display">Sanimo</AppText>
        <AppText variant="h1">Titre H1 · Montserrat</AppText>
        <AppText variant="h2">Titre H2</AppText>
        <AppText variant="h3">Titre H3</AppText>
        <AppText>Texte courant · Inter 17. Dekri sentòm bèt ou.</AppText>
        <AppText variant="bodyStrong">Texte appuyé</AppText>
        <AppText variant="small">Petit texte secondaire</AppText>
        <AppText variant="caption">LÉGENDE</AppText>
      </Section>

      <Section title="Boutons">
        <Button title="Kòmanse (primary)" />
        <Button title="Wi, se sa (confirm)" variant="confirm" />
        <Button title="Kontinye san IA (secondary)" variant="secondary" />
        <Button title="Chargement" loading />
        <Button title="Désactivé" disabled />
        <Button title="Petit bouton (md)" size="md" />
        <IjansButton />
      </Section>

      <Section title="Niveaux d'urgence">
        <View style={styles.row}>
          <LevelBadge level="ijans" />
          <LevelBadge level="konsilte" />
          <LevelBadge level="siveye" />
        </View>
        <LevelBadge level="ijans" size="lg" />
        <LevelBadge level="konsilte" size="lg" />
        <LevelBadge level="siveye" size="lg" />
      </Section>

      <Section title="Choix">
        <ChoiceCard title="Chen" icon={Dog} selected={species === 'chien'} onPress={() => setSpecies('chien')} />
        <ChoiceCard title="Chat" subtitle="Avec sous-titre" icon={Cat} selected={species === 'chat'} onPress={() => setSpecies('chat')} />
        <CheckRow
          label="L ap vomi"
          hint="Vomit"
          checked={checked.a}
          onToggle={() => setChecked((c) => ({ ...c, a: !c.a }))}
        />
        <CheckRow
          label="Li gen difikilte pou l respire"
          checked={checked.b}
          alert
          alertLabel="Siy ijans"
          onToggle={() => setChecked((c) => ({ ...c, b: !c.b }))}
        />
      </Section>

      <Section title="Divers">
        <ListenButton playing={playing} onPress={() => setPlaying((p) => !p)} />
        <ProgressSteps current={2} total={5} />
        <Banner tone="info">Information neutre.</Banner>
        <Banner tone="offline">Pake IA a pa la : Sanimo ap mache ak klavye a.</Banner>
        <Banner tone="warning">Attention (ambre, texte Encre).</Banner>
        <Card>
          <AppText variant="h3">Carte</AppText>
          <AppText>Contenu libre.</AppText>
        </Card>
      </Section>

      <Section title="Outils de test">
        <Button title="Rejouer la première ouverture" variant="secondary" size="md" onPress={resetSettings} />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption">{title.toUpperCase()}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md, paddingBottom: spacing.lg },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { width: 96, gap: spacing.xs },
  swatchColor: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
