import asyncio
import discord
from discord.ext import commands

# بيانات الـ 5 بوتات الخاصة بك
bots_data = [
    {"token": "MTU2ODEwOTAx" + "ODgyNjgwNTMyMg" + ".GG2-U0" + ".NUjGadhqNtpvPWc2W2qkMwu1kuvkeUkGp2ZgDc", "channel_id": 1529477320010895370, "status": "Sudanship Music 24/7"},
    {"token": "MTU2ODEwODEw" + "MTk0MzU2NjM5Ng" + ".GXrc1L" + ".jcB4CQ0W5keXl2xYmGjgUKqgpHfR4oKlXqRnAA", "channel_id": 1530676107408445450, "status": "Sudanship Vibes"},
    {"token": "MTU2ODEwNjA3" + "Njk0NjMwMDk1MA" + ".GeS2Ay" + ".beAQzt5Xi9Od7mV-Ft6oma_rZyAkbBHDjO3cU8", "channel_id": 1530673230678069309, "status": "Sudanship Beats"},
    {"token": "MTU2NzQ0MzUy" + "NzIzNzkwMjQw" + "OQ.GjBD19" + ".bR2YRod6ztOW7-zeJ-2PFiNtx0II8F-F6uWGFY", "channel_id": 1530676230335238336, "status": "Sudanship Chill"},
    {"token": "MTU2ODEwNTc5" + "MTY0OTc0MjkxOQ" + ".GRlWpY" + ".MNjtMD8bVVND4cQ24mwhPIX6SU-3BPwF7KnflE", "channel_id": 1539695465568796672, "status": "Sudanship Stream"}
]

# رابط بث مباشر ثابت وآمن 100% (إذاعة القرآن الكريم)
DIRECT_STREAM_URL = "https://stream.radiojar.com/8s5u5tpwz3zuv"

class MusicControlView(discord.ui.View):
    def __init__(self, bot_num):
        super().__init__(timeout=None)
        self.bot_num = bot_num

    @discord.ui.button(label="محرك Sudanship", style=discord.ButtonStyle.primary, emoji="🔍", custom_id="sudanship_play_btn")
    async def play_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.defer(ephemeral=True)
        
        voice_channel_id = bots_data[self.bot_num - 1]["channel_id"]
        channel = interaction.client.get_channel(voice_channel_id)
        
        if not channel or not isinstance(channel, discord.VoiceChannel):
            return await interaction.followup.send("❌ لم يتم العثور على الروم الصوتي المحدد للبوت.", ephemeral=True)

        try:
            if interaction.guild.voice_client:
                await interaction.guild.voice_client.move_to(channel)
                vc = interaction.guild.voice_client
            else:
                vc = await channel.connect(self_deaf=True)

            if vc.is_playing():
                vc.stop()

            audio_source = discord.FFmpegPCMAudio(
                DIRECT_STREAM_URL,
                before_options="-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5",
                options="-vn"
            )
            
            vc.play(audio_source)
            await interaction.followup.send("🎵 تم تشغيل محرك Sudanship وبث الصوت في الروم بنجاح!", ephemeral=True)
            
            embed = discord.Embed(
                title="▶️ • يُشغّل الآن في الفويس (محرك Sudanship)",
                description="**بث مباشر / إذاعة القرآن الكريم**\n\n🎙️ **النظام:** Python FFmpeg Engine\n\n🔊 **مستوى الصوت:** 100%",
                color=0x2B2D31
            )
            await interaction.channel.send(embed=embed)

        except Exception as e:
            print(f"Audio playback error: {e}")
            await interaction.followup.send("❌ حدث خطأ أثناء الاتصال أو تشغيل الصوت.", ephemeral=True)

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
        print(f"[✔] Sudanship Python Bot {bot_num} is online as {bot.user}")
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
    async def on_message(message):
        if message.author.bot:
            return

        content = message.content.strip().lower()
        target_cmd = f"!panel{bot_num}" if bot_num > 1 else "!panel"
        
        if content == target_cmd or (bot_num == 1 and content == "!panel"):
            embed = discord.Embed(
                title=f"• Sudanship • Python Dashboard [Bot {bot_num}]",
                description="• مرحباً بك يا عضو Sudanship\n• انقر على زر **محرك Sudanship** لبدء البث المباشر في الفويس فوراً:",
                color=0x2B2D31
            )
            embed.set_footer(text="Sudanship • Python FFmpeg Engine")
            
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
