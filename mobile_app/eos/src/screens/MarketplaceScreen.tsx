import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView, Alert, Image, useWindowDimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, cardShadow } from '../theme/dark';
import { addOrderNotif } from './orderNotifs';

type Product = { id: number; name: string; brand: string; price: number; rating: number; reviews: number; category: string; icon: string; stock: boolean; tag?: string; images?: string[] }; // images: add as many photo URLs as you want

// Example data — replace with your API call.
const PRODUCTS: Product[] = [
  { id: 1, name: 'Whey Protein 1kg', brand: 'PowerFuel', price: 89, rating: 4.8, reviews: 312, category: 'Supplements', icon: 'package', stock: true, tag: 'Best seller', images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80', 'https://images.unsplash.com/photo-1579722820303-d8e4223a0500?w=800&q=80'], },
  { id: 2, name: 'Creatine Monohydrate', brand: 'PureLab', price: 49, rating: 4.6, reviews: 198, category: 'Supplements', icon: 'package', stock: true, images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80'], },
  { id: 3, name: 'Grip Yoga Mat', brand: 'FlexOne', price: 65, rating: 4.7, reviews: 87, category: 'Equipment', icon: 'activity', stock: true, tag: 'New', images: ['https://images.unsplash.com/photo-1520974473983-0aefb6a9be5a?w=800&q=80', 'https://images.unsplash.com/photo-1526403224648-8b3c8aa8d3fd?w=800&q=80', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80'] },
  { id: 4, name: 'Resistance Bands Set', brand: 'FlexOne', price: 29, rating: 4.4, reviews: 64, category: 'Equipment', icon: 'activity', stock: false, images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80', 'https://images.unsplash.com/photo-1599050931443-fc4b0f9a49f2?w=800&q=80', 'https://images.unsplash.com/photo-1603351154351-5f9b7d5f8d49?w=800&q=80'], },
  { id: 5, name: 'Seamless Leggings', brand: 'Aura', price: 59, rating: 4.9, reviews: 241, category: 'Apparel', icon: 'shopping-bag', stock: true },
  { id: 6, name: 'Studio Crop Top', brand: 'Aura', price: 35, rating: 4.3, reviews: 52, category: 'Apparel', icon: 'shopping-bag', stock: true },
  { id: 7, name: 'Electrolyte Drink x12', brand: 'HydraPlus', price: 24, rating: 4.5, reviews: 133, category: 'Drinks', icon: 'droplet', stock: true },
  { id: 8, name: 'Steel Water Bottle', brand: 'HydraPlus', price: 19, rating: 4.6, reviews: 76, category: 'Drinks', icon: 'droplet', stock: true, tag: 'New' },
];
const CATEGORIES = ['All', 'Supplements', 'Equipment', 'Apparel', 'Drinks'];
const SORTS = ['Popular', 'Price: low to high', 'Price: high to low', 'Top rated'];
const PRICES: { label: string; max: number }[] = [{ label: 'Any', max: Infinity }, { label: '< 30', max: 30 }, { label: '< 60', max: 60 }, { label: '< 100', max: 100 }];
const desc = (p: Product) =>
  `${p.name} by ${p.brand} is a top pick in our ${p.category.toLowerCase()} range. Made with high quality materials and trusted by our members, it is designed to support your training and recovery every day. Follow the usage instructions on the packaging, store in a cool dry place, and combine it with a balanced diet and regular workouts for the best results.`;
const Stars = ({ rating }: { rating: number }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons key={i} name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline'} size={16} color={rating >= i - 0.5 ? colors.gold : colors.grayDim} />
    ))}
  </View>
);
const Pic = ({ uri, icon, size, style }: { uri?: string; icon: string; size: number; style?: any }) => {
  const [bad, setBad] = useState(false);
  return uri && !bad
    ? <Image source={{ uri }} style={style} resizeMode="contain" onError={() => setBad(true)} />
    : <Feather name={icon as any} size={size} color={colors.goldLight} />;
};
const SHIPPING = 7;
const PROMOS: Record<string, number> = { EOS10: 0.1 };

type Props = {
  onBack?: () => void;
  onCartChange?: (count: number, total: number) => void;
  bagSignal?: number;
  onOrderPlaced?: (order: { items: { name: string; qty: number }[]; count: number; total: number }) => void;
};

export default function MarketplaceScreen({ onCartChange, onOrderPlaced, bagSignal = 0 }: Props) {
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState(SORTS[0]);
  const [price, setPrice] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [fav, setFav] = useState<number[]>([]);
  const [detail, setDetail] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [more, setMore] = useState(false);
  const { width } = useWindowDimensions();
  const [heroH, setHeroH] = useState(300);
  const [imgI, setImgI] = useState(0);
  const [bag, setBag] = useState(false);
  const [placed, setPlaced] = useState<{ count: number; total: number } | null>(null);
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);

  const list = useMemo(() => {
    let r = PRODUCTS.filter((p) =>
      (cat === 'All' || p.category === cat) &&
      p.price <= PRICES[price].max &&
      (!inStock || p.stock) &&
      (p.name + p.brand).toLowerCase().includes(q.trim().toLowerCase()));
    if (sort === SORTS[1]) r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === SORTS[2]) r = [...r].sort((a, b) => b.price - a.price);
    else if (sort === SORTS[3]) r = [...r].sort((a, b) => b.rating - a.rating);
    return r;
  }, [q, cat, sort, price, inStock]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = PRODUCTS.reduce((a, p) => a + (cart[p.id] || 0) * p.price, 0);
  const ship = subtotal ? SHIPPING : 0;
  const total = Math.round((subtotal * (1 - discount) + ship) * 100) / 100;
  const bagItems = PRODUCTS.filter((p) => cart[p.id]);
  const activeFilters = (cat !== 'All' ? 1 : 0) + (sort !== SORTS[0] ? 1 : 0) + (price ? 1 : 0) + (inStock ? 1 : 0);

  useEffect(() => { onCartChange?.(count, subtotal); }, [count, subtotal]);
  const lastBagSignal = useRef(bagSignal);
  useEffect(() => {
    if (bagSignal !== lastBagSignal.current) { lastBagSignal.current = bagSignal; setBag(true); }
  }, [bagSignal]);

  const setQ2 = (id: number, n: number) => setCart((c) => { const x = { ...c }; if (n <= 0) delete x[id]; else x[id] = n; return x; });
  const toggleFav = (id: number) => setFav((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const reset = () => { setCat('All'); setSort(SORTS[0]); setPrice(0); setInStock(false); };
  const open = (p: Product) => { setQty(1); setMore(false); setImgI(0); setDetail(p); };
  const applyPromo = () => {
    const d = PROMOS[promo.trim().toUpperCase()];
    if (d) setDiscount(d); else { setDiscount(0); Alert.alert('Invalid code'); }
  };
  const checkout = () => Alert.alert('Confirm order', `${count} item(s) — ${total} TND`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Confirm', onPress: () => {
      const items = bagItems.map((p) => ({ name: p.name, qty: cart[p.id] }));
      addOrderNotif({ items, total });
      onOrderPlaced?.({ items, count, total });
      setPlaced({ count, total });
      setCart({}); setDiscount(0); setPromo(''); setBag(false);
    } },
  ]);


  const Card = ({ p }: { p: Product }) => (
    <Pressable style={s.card} onPress={() => open(p)}>
      <View style={[s.thumb, { height: 170 }]}>
        <Pic uri={p.images?.[0]} icon={p.icon} size={60} style={{ width: '100%', height: '100%' }} />
        {!!p.tag && <View style={s.tag}><Text style={s.tagText}>{p.tag}</Text></View>}
      </View>
      <Text style={s.pName} numberOfLines={1}>{p.name}</Text>
      <Text style={s.sub} numberOfLines={1}>{p.brand} · {p.category}</Text>
      <View style={s.priceRow}>
        <Text style={s.price}>{p.price} TND</Text>
        <TouchableOpacity style={s.heartBtn} onPress={() => toggleFav(p.id)} hitSlop={6}>
          <Ionicons name="heart" size={16} color={fav.includes(p.id) ? colors.red : colors.white} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  const Stepper = ({ n, onChange }: { n: number; onChange: (n: number) => void }) => (
    <View style={s.stepper}>
      <TouchableOpacity style={s.stepBtn} onPress={() => onChange(n - 1)} hitSlop={6}><Feather name="minus" size={14} color={colors.white} /></TouchableOpacity>
      <Text style={s.stepN}>{n}</Text>
      <TouchableOpacity style={[s.stepBtn, s.stepBtnOn]} onPress={() => onChange(n + 1)} hitSlop={6}><Feather name="plus" size={14} color={colors.black} /></TouchableOpacity>
    </View>
  );

  const Chip = ({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) => (
    <TouchableOpacity style={[s.chip, on && s.chipOn]} onPress={onPress}>
      <Text style={[s.chipText, on && { color: colors.black }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ gap: 18, paddingBottom: 110 }}>
      {/* Search + filter */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={[s.search, focus && s.searchFocus]}>
          <Feather name="search" size={18} color={focus ? colors.goldLight : colors.gray} />
          <TextInput
            value={q} onChangeText={setQ} placeholder="Search products or brands" placeholderTextColor={colors.grayDim}
            style={s.input} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} autoCapitalize="none"
          />
          {!!q && <TouchableOpacity onPress={() => setQ('')} hitSlop={8}><Feather name="x" size={16} color={colors.gray} /></TouchableOpacity>}
        </View>
        <TouchableOpacity style={s.filterBtn} onPress={() => setSheet(true)}>
          <Feather name="sliders" size={18} color={colors.white} />
          {activeFilters > 0 && <View style={s.badge}><Text style={s.badgeText}>{activeFilters}</Text></View>}
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginHorizontal: -4 }}>
        <View style={{ flex: 1, gap: 12 }}>
          <Text style={[s.found, { marginBottom: 6 }]}>Found{'\n'}{list.length} {list.length === 1 ? 'Result' : 'Results'}</Text>
          {list.filter((_, i) => i % 2 === 1).map((p) => <Card key={p.id} p={p} />)}
        </View>
        <View style={{ flex: 1, gap: 12 }}>
          {list.filter((_, i) => i % 2 === 0).map((p) => <Card key={p.id} p={p} />)}
        </View>
      </View>
      {list.length === 0 && <View style={s.empty}><Feather name="search" size={26} color={colors.grayDim} /><Text style={s.emptyText}>No products match your search.</Text></View>}

      {/* Product detail */}
      <Modal visible={!!detail} animationType="slide" statusBarTranslucent onRequestClose={() => setDetail(null)}>
        {detail && (
          <View style={s.fullBleed}>
            <View style={s.topAbs}>
              <TouchableOpacity style={s.roundBtn} onPress={() => setDetail(null)}><Feather name="arrow-left" size={18} color={colors.white} /></TouchableOpacity>
              <TouchableOpacity style={s.roundBtn} onPress={() => toggleFav(detail.id)}>
                <Ionicons name="heart" size={20} color={fav.includes(detail.id) ? colors.red : colors.white} />
              </TouchableOpacity>
            </View>
            <View style={s.heroFull} onLayout={(e) => setHeroH(e.nativeEvent.layout.height)}>
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ width }}
                onMomentumScrollEnd={(e) => setImgI(Math.round(e.nativeEvent.contentOffset.x / width))}>
                {(detail.images?.length ? detail.images : [null]).map((u, i) => (
                  <View key={i} style={{ width, height: heroH, alignItems: 'center', justifyContent: 'center' }}>
                    <Pic uri={u ?? undefined} icon={detail.icon} size={110} style={{ width: '90%', height: '80%' }} />
                  </View>
                ))}
              </ScrollView>
              {(detail.images?.length ?? 0) > 1 && (
                <View style={s.dots}>
                  {detail.images!.map((_, i) => <View key={i} style={[s.dot, i === imgI && s.dotOn]} />)}
                </View>
              )}
            </View>
            <View style={[s.tiles, { paddingHorizontal: 20, marginTop: 14 }]}>
              {[{ i: 'tag', l: detail.category }, { i: 'award', l: detail.brand }, { i: detail.stock ? 'check-circle' : 'x-circle', l: detail.stock ? 'In stock' : 'Sold out' }].map((x) => (
                <View key={x.l} style={s.tile}><Feather name={x.i as any} size={20} color={colors.goldLight} /><Text style={s.tileText} numberOfLines={1}>{x.l}</Text></View>
              ))}
            </View>
            <View style={{ height: 380 }} />
            <View style={s.detailCard}>
              <View style={s.rowBetween}>
                <Text style={[s.dName, { flex: 1 }]}>{detail.name}</Text>
                <Text style={s.dPrice}>{detail.price} TND</Text>
              </View>
              <Text style={s.sub}>{detail.brand} · {detail.category}</Text>
              <View style={[s.rowBetween, { justifyContent: 'flex-start', marginTop: 10 }]}>
                <Stars rating={detail.rating} />
                <Text style={s.dRating}>{detail.rating}</Text>
                <Text style={s.sub}>({detail.reviews} Reviews)</Text>
              </View>
              <Text style={s.descTitle}>Description</Text>
              <Text style={s.desc} numberOfLines={more ? undefined : 3}>{desc(detail)}</Text>
              <TouchableOpacity onPress={() => setMore((v) => !v)}><Text style={s.readMore}>{more ? 'Read less' : 'Read more'}</Text></TouchableOpacity>
              <View style={[s.rowBetween, { marginTop: 16 }]}>
                <Stepper n={qty} onChange={(n) => setQty(Math.max(1, n))} />
                <TouchableOpacity
                  style={[s.cartBtn, { flex: 1 }, !detail.stock && { opacity: 0.35 }]} disabled={!detail.stock}
                  onPress={() => { setQ2(detail.id, (cart[detail.id] || 0) + qty); setDetail(null); }}
                >
                  <Text style={s.cartBtnText}>Add to Cart · {detail.price * qty} TND</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>

      {/* Shopping bag */}
      <Modal visible={bag} animationType="slide" statusBarTranslucent onRequestClose={() => setBag(false)}>
        <View style={s.full}>
          <View style={s.topRow}>
            <TouchableOpacity style={s.roundBtn} onPress={() => setBag(false)}><Feather name="arrow-left" size={18} color={colors.white} /></TouchableOpacity>
            <Text style={s.bagTitle}>Shopping Bag</Text>
            <View style={s.roundBtn}><Feather name="shopping-bag" size={18} color={colors.goldLight} /></View>
          </View>
          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            {bagItems.length === 0 && <View style={s.empty}><Feather name="shopping-bag" size={26} color={colors.grayDim} /><Text style={s.emptyText}>Your bag is empty.</Text></View>}
            {bagItems.map((p) => (
              <View key={p.id} style={s.bagItem}>
                <View style={s.bagThumb}><Feather name={p.icon as any} size={26} color={colors.goldLight} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.pName} numberOfLines={1}>{p.name}</Text>
                  <Text style={s.sub}>{p.brand}</Text>
                  <Text style={s.price}>{p.price} TND</Text>
                </View>
                <Stepper n={cart[p.id]} onChange={(n) => setQ2(p.id, n)} />
              </View>
            ))}
            <View style={s.promoRow}>
              <TextInput value={promo} onChangeText={setPromo} placeholder="Promo Code" placeholderTextColor={colors.grayDim} style={s.promoInput} autoCapitalize="characters" />
              <TouchableOpacity style={s.applyBtn} onPress={applyPromo}><Text style={s.applyText}>Apply</Text></TouchableOpacity>
            </View>
            <View style={{ gap: 10, marginTop: 6 }}>
              <View style={s.rowBetween}><Text style={s.sumL}>Subtotal</Text><Text style={s.sumV}>{subtotal} TND</Text></View>
              {discount > 0 && <View style={s.rowBetween}><Text style={s.sumL}>Discount</Text><Text style={s.sumV}>-{Math.round(subtotal * discount * 100) / 100} TND</Text></View>}
              <View style={s.rowBetween}><Text style={s.sumL}>Shipping</Text><Text style={s.sumV}>{ship} TND</Text></View>
              <View style={[s.rowBetween, s.totalRow]}><Text style={s.sumL}>Bag Total <Text style={{ color: colors.grayDim }}>({count} items)</Text></Text><Text style={s.total}>{total} TND</Text></View>
            </View>
          </ScrollView>
          <TouchableOpacity style={[s.checkout, !count && { opacity: 0.35 }]} disabled={!count} onPress={checkout}>
            <Text style={s.checkoutText}>Proceed To Checkout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Filter sheet */}
      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={s.overlay} onPress={() => setSheet(false)} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Filters</Text>
          <Text style={s.label}>PRODUCT TYPE</Text>
          <View style={s.wrap}>{CATEGORIES.map((c) => <Chip key={c} on={cat === c} label={c} onPress={() => setCat(c)} />)}</View>
          <Text style={s.label}>SORT BY</Text>
          <View style={s.wrap}>{SORTS.map((o) => <Chip key={o} on={sort === o} label={o} onPress={() => setSort(o)} />)}</View>
          <Text style={s.label}>PRICE (TND)</Text>
          <View style={s.wrap}>{PRICES.map((o, i) => <Chip key={o.label} on={price === i} label={o.label} onPress={() => setPrice(i)} />)}</View>
          <TouchableOpacity style={s.stockRow} onPress={() => setInStock((v) => !v)}>
            <Text style={s.pName}>In stock only</Text>
            <View style={[s.check, inStock && s.checkOn]}>{inStock && <Feather name="check" size={13} color={colors.black} />}</View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={reset}><Text style={[s.btnText, { color: colors.white }]}>Reset</Text></TouchableOpacity>
            <TouchableOpacity style={s.btn} onPress={() => setSheet(false)}><Text style={s.btnText}>Show {list.length} results</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={!!placed} transparent animationType="fade" onRequestClose={() => setPlaced(null)}>
        <View style={s.successOverlay}>
          <View style={s.successBox}>
            <View style={s.successIcon}><Feather name="check" size={28} color={colors.black} /></View>
            <Text style={s.successTitle}>Order placed</Text>
            <Text style={s.successText}>
              Your order ({placed?.count} item{placed?.count === 1 ? '' : 's'}, {placed?.total} TND) has been received. Our service team will call you soon to confirm it.
            </Text>
            <TouchableOpacity style={[s.btn, { alignSelf: 'stretch', flex: 0 }]} onPress={() => setPlaced(null)}>
              <Text style={s.btnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16, borderRadius: 26, backgroundColor: colors.charcoal2, borderWidth: 1, borderColor: colors.line, ...cardShadow },
  searchFocus: { borderColor: colors.gold },
  input: { flex: 1, color: colors.white, fontSize: 14.5, paddingVertical: 0 },
  filterBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.charcoal2, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', ...cardShadow },
  badge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: colors.black, fontSize: 10, fontWeight: '800' },
  found: { color: colors.white, fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.5 },
  card: { backgroundColor: colors.charcoal2, borderRadius: 28, padding: 12, gap: 4, borderWidth: 1, borderColor: colors.lineSoft, ...cardShadow },
  thumb: { borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tag: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.greenLight, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { color: colors.black, fontSize: 9.5, fontWeight: '800' },
  pName: { color: colors.white, fontSize: 14, fontWeight: '700', paddingHorizontal: 4 },
  sub: { color: colors.gray, fontSize: 11.5, paddingHorizontal: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 },
  price: { color: colors.goldLight, fontSize: 15, fontWeight: '800' },
  heartBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: colors.gray, fontSize: 13 },

  full: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 54, gap: 16 },
  fullBleed: { flex: 1, backgroundColor: colors.bg },
  topAbs: { position: 'absolute', top: 54, left: 20, right: 20, zIndex: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#3b3a36', alignItems: 'center', justifyContent: 'center' },
  hero: { flex: 1, minHeight: 160, borderRadius: 32, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lineSoft },
  dots: { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.grayDim },
  dotOn: { width: 20, backgroundColor: colors.greenLight },
  heroFull: { flex: 1, minHeight: 200, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, height: 74, borderRadius: 20, backgroundColor: colors.charcoal2, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 6 },
  tileText: { color: colors.gray, fontSize: 11, fontWeight: '600' },
  detailCard: { position: 'absolute', bottom: 0, left: 0, right: 0, minHeight: 360, backgroundColor: colors.charcoal2, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 34, gap: 4, borderWidth: 1, borderColor: colors.lineSoft },
  descTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginTop: 16 },
  desc: { color: colors.gray, fontSize: 13, lineHeight: 19, marginTop: 4 },
  readMore: { color: colors.goldLight, fontSize: 13, fontWeight: '700', marginTop: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dName: { color: colors.white, fontSize: 18, fontWeight: '800' },
  dRating: { color: colors.white, fontSize: 13, fontWeight: '700' },
  dPrice: { color: colors.goldLight, fontSize: 24, fontWeight: '800' },
  cartBtn: { height: 46, paddingHorizontal: 22, borderRadius: 16, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  cartBtnText: { color: colors.black, fontWeight: '800', fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  stepBtnOn: { backgroundColor: colors.greenLight, borderColor: colors.greenLight },
  stepN: { color: colors.white, fontSize: 13, fontWeight: '700', minWidth: 16, textAlign: 'center' },

  bagTitle: { color: colors.white, fontSize: 16, fontWeight: '700' },
  bagItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.charcoal2, borderRadius: 22, padding: 12 },
  bagThumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(245,244,240,0.05)', alignItems: 'center', justifyContent: 'center' },
  promoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.charcoal2, borderRadius: 18, padding: 6, paddingLeft: 16 },
  promoInput: { flex: 1, color: colors.white, fontSize: 14, paddingVertical: 8 },
  applyBtn: { backgroundColor: colors.black, borderRadius: 14, paddingHorizontal: 22, height: 40, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  sumL: { color: colors.gray, fontSize: 14 },
  sumV: { color: colors.white, fontSize: 15, fontWeight: '700' },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  total: { color: colors.goldLight, fontSize: 20, fontWeight: '800' },
  checkout: { height: 56, borderRadius: 28, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  checkoutText: { color: colors.black, fontWeight: '800', fontSize: 15 },

  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.goldLight, borderColor: colors.goldLight },
  chipText: { color: colors.gray, fontSize: 12.5, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: { backgroundColor: colors.charcoal2, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 34, gap: 12 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.line },
  sheetTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  label: { color: colors.gray, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.grayDim, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.goldLight, borderColor: colors.goldLight },
  btn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: colors.black },
  btnText: { color: colors.black, fontWeight: '800', fontSize: 14 },

  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successBox: { width: '100%', backgroundColor: colors.charcoal2, borderRadius: 24, padding: 24, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.lineSoft },
  successIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.greenLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  successText: { color: colors.gray, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 8 },
});
