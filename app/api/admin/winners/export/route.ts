import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all winners
    const { data, error } = await supabase
      .from('event_entries')
      .select(`
        id,
        name,
        email,
        whatsapp_number,
        address,
        city,
        pincode,
        created_at,
        events:event_id (name),
        prizes:prize_id (name)
      `)
      .not('prize_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching winners for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch winners' },
        { status: 500 }
      );
    }

    // Format data for CSV
    const formattedData = data.map((winner: any) => ({
      id: winner.id,
      name: winner.name,
      email: winner.email || '',
      whatsapp_number: winner.whatsapp_number,
      address: winner.address,
      city: winner.city,
      pincode: winner.pincode,
      event_name: winner.events?.name || 'Unknown Event',
      prize_name: winner.prizes?.name || 'Unknown Prize',
      created_at: format(new Date(winner.created_at), 'yyyy-MM-dd HH:mm:ss'),
    }));

    // Convert to CSV
    const headers = [
      'Entry ID',
      'Name',
      'Email',
      'WhatsApp Number',
      'Address',
      'City',
      'Pincode',
      'Event',
      'Prize',
      'Created At',
    ];

    const csvRows = [
      headers.join(','),
      ...formattedData.map((row: any) => {
        return [
          `"${row.id}"`,
          `"${row.name.replace(/"/g, '""')}"`,
          `"${row.email.replace(/"/g, '""')}"`,
          `"${row.whatsapp_number}"`,
          `"${row.address.replace(/"/g, '""')}"`,
          `"${row.city.replace(/"/g, '""')}"`,
          `"${row.pincode}"`,
          `"${row.event_name.replace(/"/g, '""')}"`,
          `"${row.prize_name.replace(/"/g, '""')}"`,
          `"${row.created_at}"`,
        ].join(',');
      }),
    ].join('\n');

    // Return CSV as a downloadable file
    return new NextResponse(csvRows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="winners-${format(
          new Date(),
          'yyyy-MM-dd'
        )}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting winners:', error);
    return NextResponse.json(
      { error: 'Failed to export winners' },
      { status: 500 }
    );
  }
} 