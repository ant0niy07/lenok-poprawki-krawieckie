import {describe,expect,it} from 'vitest';
import {buildRequestMessage,calculateTotal,formatPrice,getAvailableServices,getServicePrice} from './estimatedPricing';
describe('pricing',()=>{
it('uses garment-specific prices',()=>{expect(getServicePrice('trousers','shortening')).toBe(40);expect(getServicePrice('jacket','shortening')).toBe(90)});
it('excludes null and handles zero state',()=>{expect(getAvailableServices('trousers')).not.toContain('sleeveShortening');expect(calculateTotal('trousers',[])).toBe(0);expect(calculateTotal('trousers',['shortening','sleeveShortening'])).toBe(40)});
it('adds multiple services',()=>expect(calculateTotal('dress',['shortening','narrowing','tearRepair'])).toBe(160));
it('formats prices',()=>expect(formatPrice(120,'pl')).toContain('120 PLN'));
it('builds complete localized messages',()=>{const base={garment:'Spodnie',items:[{name:'Skrócenie',price:40}],total:40,date:'2026-09-01',name:'Anna',phone:'123456789'};expect(buildRequestMessage({lng:'pl',...base})).toContain('Rozumiem');expect(buildRequestMessage({lng:'en',...base})).toContain('final price');expect(buildRequestMessage({lng:'ru',...base})).toContain('итоговая')});
});
