import asyncio
import warnings
import aiohttp

# منع ظهور التحذيرات المزعجة
warnings.filterwarnings("ignore", category=ResourceWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

import discord
from discord.ext import commands
import yt_dlp

# أسطول الـ 15 بوت كاملاً مع التوكنات الصحيحة وحماية الرومات
bots_data = [
    {"token": "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", "channel_id": 1529477320010895370, "status": "Sudanship Music 1"},
    {"token": "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", "channel_id": 1530676107408445450, "status": "Sudanship Music 2"},
    {"token": "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", "channel_id": 1530673230678069309, "status": "Sudanship Music 3"},
    {"token": "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", "channel_id": 1530676230335238336, "status": "Sudanship Music 4"},
    {"token": "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE", "channel_id": 1539695465568796672, "status": "Sudanship Music 5"},
    {"token": "MTUyNDcyODkw" + "NTU0NDc2MTQ3NQ" + ".G-DiBw" + ".XhOWj4ZLpmSyNytmFcI93BHMXdG7by8HIMevIA", "channel_id": 1569004339987611718, "status": "Sudanship Music 6"},
    {"token": "MTUzODYyMjIy" + "MjY2NTY1MDIwNw" + ".G7o5hk" + ".jo45L9eCzRy-uNDrO5pa8uTHo-u_jMbIwDBoBA", "channel_id": 1569004395444834404, "status": "Sudanship Music 7"},
    {"token": "MTU0OTc2Nzkz" + "OTcxMDc4MzUyOQ" + ".GOtt_R" + ".JgGqu_jbp0mYLgPS0_0EHuz2hSgVIgvh_8BsIM", "channel_id": 1569004542174167060, "status": "Sudanship Music 8"},
    {"token": "MTU0OTc2Njg2" + "NzAyNjA1NTMwMA" + ".GCjpKp" + ".wwpfbJzB6HskMKzXJMW9GiFpSMhGi8x1_fblKA", "channel_id": 1569004632221679636, "status": "Sudanship Music 9"},
    {"token": "MTU0OTg5Mjg3" + "MDc2NzY0ODg0OA" + ".Gwe3tg" + ".bs-IgVBYmDMslPTPGeoxzuw9H4lQjBTxtIfm7Y", "channel_id": 1569005086036992162, "status": "Sudanship Music 10"},
    {"token": "MTU0OTg5NDcw" + "NjUyNjQyNTExMA" + ".GxN42w" + ".z3vPxON5pJUSMug2Mxh6c32rRmNIXcEtExhhCA", "channel_id": 1569005118001778828, "status": "Sudanship Music 11"},
    {"token": "MTU1MDE3MTY1" + "MzcxODI4MjM0Mg" + ".GhmCIq" + ".Ze7met0fqT4Tzw4a9H7PozkihZPIpHZ5c1Q5AQ", "channel_id": 1569005157235171430, "status": "Sudanship Music 12"},
    {"token": "MTU1MDgxNTk4" + "Mzc3MjYzOTMzMg" + ".GTVyUi" + ".J3icId8MvxRuN9XVGO0VXkSahU5NQV_IVrN0Dc", "channel_id": 1569005196535664760, "status": "Sudanship Music 13"},
    {"token": "MTU1MDUyNzQ3" + "MzQ4ODM2NzY2Nw" + ".GkisWG" + ".xsMpQq1PytJxEUbAdLa5n6kidL3huekLl5gE5o", "channel_id": 1569005232262746162, "status": "Sudanship Music 14"},
    {"token": "MTU1NDIzNzQz" + "MTQ5NzY0NjEwOA" + ".Z2hK1a" + ".XhOWj4ZLpmSyNytmFcI93BHMXdG7by8HIMevIA", "channel_id": 1569004339987611718, "status": "Sudanship Music 15"}
]

YDL_SEARCH_OPTIONS = {
    'format': 'bestaudio',
    'default_search': 'ytsearch5',
    'noplaylist': True,
    'quiet': True,
    'extract_flat': True
}

YDL_PLAY_OPTIONS = {
    'format': 'bestaudio/best',
    'noplaylist': True,
    'quiet': True
}

FFMPEG_OPTIONS = {
    'before_options': '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5 -nostdin',
    'options': '-vn'
}

class SongSelectView(discord.ui.View):
    def __init__(self, tracks, bot_num):
        super().__init__(timeout=60)
        self.tracks = tracks
        self.bot_num = bot_num
        
        options = []
        for i, track in enumerate(tracks[:5]):
            title = track.get('title', 'Unknown')[:99]
            options.append(discord.SelectOption(label=title, value=str(i)))

        self.select_menu = discord.ui.Select(placeholder="اختر المقطع للتشغيل الفوري...", options=options)
        self.select_menu.callback = self.select_callback
        self.add_item(self.select_menu)

    async def select_callback(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        selected_index = int(self.select_menu.values[0])
        track = self.tracks[selected_index]
        
        url = track.get('url')
        if not url and 'id' in track:
            url = f"https://www.youtube.com/watch?v={track['id']}"
            
        title = track.get('title', 'مقطع صوتي')
        voice_channel_id = bots_data[self.bot_num - 1]["channel_id"]
        channel = interaction.client.get_channel(voice_channel_id)

        try:
            if interaction.guild.voice_client:
                await interaction.guild.voice_client.move_to(channel)
                vc = interaction.guild.voice_client
            else:
                vc = await channel.connect(self_deaf=True)

            if vc.is_playing():
                vc.stop()

            with yt_dlp.YoutubeDL(YDL_PLAY_OPTIONS) as ydl:
                info = ydl.extract_info(url, download=False)
                if 'entries' in info:
                    info = info['entries'][0]
                audio_url = info.get('url')

            if not audio_url:
                return await interaction.followup.send("❌ تعذر استخراج رابط البث الصوتي.", ephemeral=True)

            audio_source = discord.FFmpegPCMAudio(audio_url, **FFMPEG_OPTIONS)
            vc.play(audio_source)

            embed = discord.Embed(
                title="▶️ • يُشغّل الآن في الفويس (محرك Sudanship الذكي)",
                description=f"**[{title}]({url})**\n\n🎙️ **النظام:** Smart Search Engine\n\n🔊 **مستوى الصوت:** 100%",
                color=0x2B2D31
            )
            await interaction.channel.send(embed=embed)
            await interaction.followup.send(f"🎵 تم تشغيل: **{title}** في الفويس بنجاح!", ephemeral=True)

        except Exception as e:
            print(f"Playback error: {e}")
            await interaction.followup.send("❌ حدث خطأ أثناء تشغيل الصوت في الفويس.", ephemeral=True)


class SearchModal(discord.ui.Modal, title="محرك Sudanship الذكي"):
    query_input = discord.ui.TextInput(
        label="اكتب اسم القرآن، الأناشيد، أو الأغاني",
        placeholder="مثال: سورة البقرة، صولجا، رامي صبري...",
        style=discord.TextStyle.short,
        required=True
    )

    def __init__(self, bot_num):
        super().__init__()
        self.bot_num = bot_num

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        query = self.query_input.value

        try:
            with yt_dlp.YoutubeDL(YDL_SEARCH_OPTIONS) as ydl:
                info = ydl.extract_info(query, download=False)
                tracks = info.get('entries', [])

            if not tracks:
                return await interaction.followup.send("❌ لم يتم العثور على نتائج بحث مطابقة.", ephemeral=True)

            view = SongSelectView(tracks, self.bot_num)
            embed = discord.Embed(
                title=f"🔍 نتائج البحث لـ: {query}",
                description="اختر المقطع المطلوب تشغيله من القائمة أدناه:",
                color=0x2B2D31
            )
            await interaction.followup.send(embed=embed, view=view, ephemeral=True)

        except Exception as e:
            print(f"Search error: {e}")
            await interaction.followup.send("❌ حدث خطأ أثناء البحث.", ephemeral=True)


class MusicControlView(discord.ui.View):
    def __init__(self, bot_num):
        super().__init__(timeout=None)
        self.bot_num = bot_num

    @discord.ui.button(label="محرك Sudanship", style=discord.ButtonStyle.primary, emoji="🔍", custom_id="sudanship_search_btn")
    async def search_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(SearchModal(self.bot_num))

    @discord.ui.button(label="إيقاف", style=discord.ButtonStyle.danger, emoji="⏹️", custom_id="sudanship_stop_btn")
    async def stop_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.guild.voice_client:
            await interaction.guild.voice_client.disconnect()
            await interaction.response.send_message("⏹️ تم إيقاف الصوت وفصل البوت عن الروم الصوتي.", ephemeral=True)
        else:
            await interaction.response.send_message("❌ البوت ليس متصلاً بأي روم صوتي حالياً.", ephemeral=True)


async def run_bot(bot_info, bot_num):
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guilds = True
    intents.voice_states = True

    bot = commands.Bot(command_prefix="!", intents=intents)

    @bot.event
    async def on_ready():
        print(f"[✔] Sudanship Smart Bot {bot_num} is online as {bot.user}")
        await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.listening, name=bot_info["status"]))
        
        await asyncio.sleep(5)
        try:
            channel = bot.get_channel(bot_info["channel_id"])
            if channel and isinstance(channel, discord.VoiceChannel):
                if not channel.guild.voice_client:
                    await channel.connect(self_deaf=True)
        except Exception as e:
            print(f"Auto join error for bot {bot_num}: {e}")

    @bot.event
    async def on_voice_state_update(member, before, after):
        if member.id == bot.user.id:
            if before.channel is not None and (after.channel is None or after.channel.id != bot_info["channel_id"]):
                await asyncio.sleep(1)
                try:
                    channel = bot.get_channel(bot_info["channel_id"])
                    if channel and isinstance(channel, discord.VoiceChannel):
                        if not channel.guild.voice_client or not channel.guild.voice_client.is_connected():
                            await channel.connect(self_deaf=True)
                        elif channel.guild.voice_client.channel.id != bot_info["channel_id"]:
                            await channel.guild.voice_client.move_to(channel)
                except Exception as e:
                    print(f"Reconnect error for bot {bot_num}: {e}")

    @bot.event
    async def on_message(message):
        if message.author.bot:
            return

        content = message.content.strip().lower()
        target_cmd = f"!panel{bot_num}" if bot_num > 1 else "!panel"
        
        if content == target_cmd or (bot_num == 1 and content == "!panel"):
            embed = discord.Embed(
                title=f"• Sudanship • Smart Engine [Bot {bot_num}]",
                description="• مرحباً بك يا عضو Sudanship\n• انقر على زر **محرك Sudanship** للبحث وتشغيل أي قرآن أو أغاني فوراً:",
                color=0x2B2D31
            )
            embed.set_footer(text="Sudanship • yt-dlp Smart System")
            
            view = MusicControlView(bot_num)
            await message.reply(embed=embed, view=view)

    try:
        await bot.start(bot_info["token"])
    except Exception as e:
        print(f"Failed to start bot {bot_num}: {e}")

async def main():
    tasks = [run_bot(bot_info, i + 1) for i, bot_info in enumerate(bots_data)]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
