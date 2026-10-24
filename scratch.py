import sys, re

with open('src/features/orders/DashboardScreen.tsx', 'r') as f:
    c = f.read()

# Colors
c = c.replace('#F6F4F0', '#F3F1EC')
c = c.replace('#191918', '#171716')
c = c.replace('#64635F', '#65635F')
c = c.replace('#E1DDD6', '#E2DED7')
c = c.replace('#ECE8E1', '#E2DED7')

# Cards shadow tweak
c = re.sub(
    r'card:\s*\{[\s\S]*?borderColor:\s*\'[^\']+\',\s*\}',
    """card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2DED7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  }""",
    c
)

# Text wrap fixes
c = c.replace('<Text style={styles.shiftChipText}>Shift 9–6</Text>', '<Text style={styles.shiftChipText} numberOfLines={1}>Shift 9–6</Text>')
c = re.sub(r'shiftChipText:\s*\{[^}]*\},', """shiftChipText: { fontSize: 12, fontWeight: '500', color: '#65635F', flexShrink: 0 },""", c)

c = c.replace('<Text style={styles.storeDetailsBtnText}>Store Details</Text>', '<Text style={styles.storeDetailsBtnText} numberOfLines={1}>Store Details</Text>')
c = re.sub(r'storeDetailsBtnText:\s*\{[^}]*\},', """storeDetailsBtnText: { fontSize: 13, fontWeight: '600', color: '#171716', flexShrink: 0 },""", c)

# Bonus header overlap fix
c = re.sub(r'bonusHeader:\s*\{[\s\S]*?\},', """bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },""", c)
c = re.sub(r'bonusSubText:\s*\{[\s\S]*?\},', """bonusSubText: { fontSize: 12, color: '#65635F', marginBottom: 14, marginTop: 2 },""", c)

with open('src/features/orders/DashboardScreen.tsx', 'w') as f:
    f.write(c)
