
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbsvvcaxngfsioukizhb.supabase.co';
const supabaseAnonKey = 'sb_publishable_lc8gEEEm2vCfjg44WYlMwA_7RQGV2Mz';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing INSERT into businesses...');
    const { data: bus, error: busError } = await supabase
        .from('businesses')
        .insert({
            name: 'Test Business ' + Date.now(),
            sector_id: 'centro',
            category_id: 'bar',
            location_lat: -1.8265,
            location_lng: -80.7533,
            address: 'Centro'
        })
        .select()
        .single();

    if (busError) {
        console.log('BUSINESS INSERT ERROR:', JSON.stringify(busError, null, 2));
        return;
    }

    console.log('BUSINESS SUCCESS! ID:', bus.id);

    console.log('\nTesting INSERT into events...');
    const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
            business_id: bus.id,
            title: 'Test Event ' + Date.now(),
            description: 'Test',
            start_at: new Date().toISOString(),
            end_at: new Date(Date.now() + 3600000).toISOString(),
            sector_id: 'centro',
            interested_count: 0
        })
        .select()
        .single();

    if (eventError) {
        console.log('EVENT INSERT ERROR:', JSON.stringify(eventError, null, 2));
    } else {
        console.log('EVENT SUCCESS! ID:', event.id);
    }
}

testInsert();
