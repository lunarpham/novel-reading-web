import {
  PrismaClient,
  Role,
  Status,
  Tag,
  NotificationType,
  Gender,
  ReadingStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  console.log("Cleaning up existing data...");
  await prisma.notification.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.userLibrary.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.story.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Database cleaned");

  // Create users with hashed passwords
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        username: "alice_writer",
        displayName: "Alice Johnson",
        password: await bcrypt.hash("password123", 10),
        role: Role.user,
        bio: "Passionate fantasy writer and bookworm. Love creating magical worlds!",
        dateOfBirth: new Date("1995-03-15"),
        avatarUrl: "https://example.com/avatars/alice.jpg",
        gender: Gender.female,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        username: "bob_storyteller",
        displayName: "Bob Smith",
        password: await bcrypt.hash("password123", 10),
        role: Role.user,
        bio: "Sci-fi enthusiast and part-time writer. Always exploring new galaxies in my stories.",
        dateOfBirth: new Date("1988-07-22"),
        avatarUrl: "https://example.com/avatars/bob.jpg",
        gender: Gender.male,
      },
    }),
    prisma.user.create({
      data: {
        email: "carol@example.com",
        username: "carol_romance",
        displayName: "Carol Davis",
        password: await bcrypt.hash("password123", 10),
        role: Role.user,
        bio: "Romance writer who believes in happily ever after. Currently working on my debut novel.",
        dateOfBirth: new Date("1992-11-08"),
        avatarUrl: "https://example.com/avatars/carol.jpg",
        gender: Gender.female,
      },
    }),
    prisma.user.create({
      data: {
        email: "david@example.com",
        username: "david_mystery",
        displayName: "David Wilson",
        password: await bcrypt.hash("password123", 10),
        role: Role.user,
        bio: "Mystery and thriller writer. Love crafting suspenseful plots that keep readers guessing.",
        dateOfBirth: new Date("1985-01-30"),
        avatarUrl: "https://example.com/avatars/david.jpg",
        gender: Gender.male,
      },
    }),
    prisma.user.create({
      data: {
        email: "admin@example.com",
        username: "admin",
        displayName: "Site Administrator",
        password: await bcrypt.hash("admin123", 10),
        role: Role.admin,
        bio: "Platform administrator ensuring the best experience for all users.",
        dateOfBirth: new Date("1980-05-12"),
        avatarUrl: "https://example.com/avatars/admin.jpg",
        gender: Gender.prefer_not_to_say,
      },
    }),
  ]);

  console.log("Created users");

  // Create follows (user relationships)
  await prisma.follow.createMany({
    data: [
      { followingUserId: users[0].id, followedUserId: users[1].id },
      { followingUserId: users[0].id, followedUserId: users[2].id },
      { followingUserId: users[1].id, followedUserId: users[0].id },
      { followingUserId: users[1].id, followedUserId: users[3].id },
      { followingUserId: users[2].id, followedUserId: users[0].id },
      { followingUserId: users[2].id, followedUserId: users[3].id },
      { followingUserId: users[3].id, followedUserId: users[1].id },
      { followingUserId: users[3].id, followedUserId: users[2].id },
    ],
  });

  console.log("Created follows");

  // Create stories for each user
  const stories = [];

  // Alice's stories
  const aliceStory1 = await prisma.story.create({
    data: {
      title: "The Enchanted Forest Chronicles",
      description:
        "A magical adventure about a young girl who discovers a hidden world of mystical creatures.",
      authorId: users[0].id,
      status: Status.on_going,
      cover: "https://example.com/covers/enchanted-forest.jpg",
      tags: [Tag.fantasy, Tag.teen, Tag.action],
      wordCount: 25000,
      publishedAt: new Date("2024-01-15"),
    },
  });

  const aliceStory2 = await prisma.story.create({
    data: {
      title: "Dragons of the Northern Realm",
      description:
        "An epic tale of dragon riders and ancient magic in a war-torn kingdom.",
      authorId: users[0].id,
      status: Status.completed,
      cover: "https://example.com/covers/dragons.jpg",
      tags: [Tag.fantasy, Tag.action, Tag.adult],
      wordCount: 80000,
      publishedAt: new Date("2023-08-20"),
    },
  });

  stories.push(aliceStory1, aliceStory2);

  // Bob's stories
  const bobStory1 = await prisma.story.create({
    data: {
      title: "Space Station Alpha",
      description:
        "Humanity's first deep space colony faces an unknown alien threat.",
      authorId: users[1].id,
      status: Status.on_going,
      cover: "https://example.com/covers/space-station.jpg",
      tags: [Tag.scifi, Tag.action, Tag.adult],
      wordCount: 45000,
      publishedAt: new Date("2024-02-10"),
    },
  });

  const bobStory2 = await prisma.story.create({
    data: {
      title: "Time Paradox",
      description:
        "A scientist accidentally creates a time loop that threatens reality itself.",
      authorId: users[1].id,
      status: Status.hiatus,
      cover: "https://example.com/covers/time-paradox.jpg",
      tags: [Tag.scifi, Tag.mystery, Tag.adult],
      wordCount: 12000,
      publishedAt: new Date("2023-12-05"),
    },
  });

  stories.push(bobStory1, bobStory2);

  // Carol's stories
  const carolStory1 = await prisma.story.create({
    data: {
      title: "Summer at Sunset Beach",
      description:
        "A heartwarming romance about second chances and finding love in unexpected places.",
      authorId: users[2].id,
      status: Status.completed,
      cover: "https://example.com/covers/sunset-beach.jpg",
      tags: [Tag.romance, Tag.adult, Tag.comedy],
      wordCount: 65000,
      publishedAt: new Date("2024-01-01"),
    },
  });

  const carolStory2 = await prisma.story.create({
    data: {
      title: "The Coffee Shop Connection",
      description:
        "Two busy professionals find love over daily coffee orders and shared smiles.",
      authorId: users[2].id,
      status: Status.on_going,
      cover: "https://example.com/covers/coffee-shop.jpg",
      tags: [Tag.romance, Tag.comedy, Tag.adult],
      wordCount: 18000,
      publishedAt: new Date("2024-03-01"),
    },
  });

  stories.push(carolStory1, carolStory2);

  // David's stories
  const davidStory1 = await prisma.story.create({
    data: {
      title: "The Silent Witness",
      description:
        "A detective races against time to solve a series of mysterious disappearances.",
      authorId: users[3].id,
      status: Status.on_going,
      cover: "https://example.com/covers/silent-witness.jpg",
      tags: [Tag.mystery, Tag.horror, Tag.adult],
      wordCount: 35000,
      publishedAt: new Date("2024-02-20"),
    },
  });

  const davidStory2 = await prisma.story.create({
    data: {
      title: "Midnight at the Manor",
      description:
        "A psychological thriller set in a haunted Victorian mansion.",
      authorId: users[3].id,
      status: Status.completed,
      cover: "https://example.com/covers/midnight-manor.jpg",
      tags: [Tag.horror, Tag.mystery, Tag.tragedy],
      wordCount: 55000,
      publishedAt: new Date("2023-10-31"),
    },
  });

  stories.push(davidStory1, davidStory2);

  console.log("Created stories");

  // Create chapters for each story
  const allChapters = [];
  for (const story of stories) {
    const chapterCount = Math.floor(Math.random() * 8) + 3; // 3-10 chapters per story

    for (let i = 0; i < chapterCount; i++) {
      const chapter = await prisma.chapter.create({
        data: {
          sortIndex: i + 1,
          title: `Chapter ${i + 1}: ${generateChapterTitle()}`,
          content: generateChapterContent(),
          storyId: story.id,
          authorId: story.authorId,
          wordCount: Math.floor(Math.random() * 3000) + 1000, // 1000-4000 words
        },
      });
      allChapters.push(chapter);
    }
  }

  console.log("Created chapters");

  // Create comments
  const comments = [];
  for (const story of stories) {
    // Each story gets 2-4 comments
    const commentCount = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < commentCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const comment = await prisma.comment.create({
        data: {
          content: generateComment(),
          userId: randomUser.id,
          storyId: story.id,
        },
      });
      comments.push(comment);
    }
  }

  console.log("Created comments");

  // Create user libraries (reading lists) with updated reading status
  for (const user of users) {
    // Each user adds 2-3 stories to their library
    const storyCount = Math.floor(Math.random() * 2) + 2;
    const userStories = stories
      .filter((story) => story.authorId !== user.id) // Don't add own stories
      .sort(() => 0.5 - Math.random())
      .slice(0, storyCount);

    for (const story of userStories) {
      const readingStatuses = [
        ReadingStatus.plan_to_read,
        ReadingStatus.reading,
        ReadingStatus.completed,
        ReadingStatus.on_hold,
        ReadingStatus.dropped,
        ReadingStatus.re_reading,
      ];

      const randomStatus =
        readingStatuses[Math.floor(Math.random() * readingStatuses.length)];

      // Get chapters for this story to set current chapter
      const storyChapters = allChapters.filter(
        (chapter) => chapter.storyId === story.id
      );
      const currentChapter =
        randomStatus === ReadingStatus.reading && storyChapters.length > 0
          ? storyChapters[Math.floor(Math.random() * storyChapters.length)].id
          : null;

      await prisma.userLibrary.create({
        data: {
          userId: user.id,
          storyId: story.id,
          readingStatus: randomStatus,
          currentChapterId: currentChapter,
          lastReadAt:
            randomStatus === ReadingStatus.reading ||
            randomStatus === ReadingStatus.completed
              ? new Date(
                  Date.now() -
                    Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
                ) // Within last 7 days
              : null,
        },
      });
    }
  }

  console.log("Created user libraries");

  // Create votes
  for (const user of users) {
    // Each user votes on 3-5 stories
    const storyCount = Math.floor(Math.random() * 3) + 3;
    const userStories = stories
      .filter((story) => story.authorId !== user.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, storyCount);

    for (const story of userStories) {
      await prisma.vote.create({
        data: {
          userId: user.id,
          storyId: story.id,
          score: Math.floor(Math.random() * 5) + 1, // 1-5 stars
        },
      });
    }
  }

  console.log("Created votes");

  // Create notifications
  for (const user of users) {
    // Each user gets 2-3 notifications
    const notificationCount = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < notificationCount; i++) {
      const types = [
        NotificationType.new_chapter,
        NotificationType.new_follower,
        NotificationType.story_comment,
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomStory = stories[Math.floor(Math.random() * stories.length)];
      const randomRelatedUser = users[Math.floor(Math.random() * users.length)];

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: randomType,
          title: generateNotificationTitle(randomType),
          message: generateNotificationMessage(randomType),
          relatedStoryId:
            randomType === NotificationType.story_comment ||
            randomType === NotificationType.new_chapter
              ? randomStory.id
              : null,
          relatedUserId:
            randomType === NotificationType.new_follower
              ? randomRelatedUser.id
              : null,
          isRead: Math.random() > 0.5,
        },
      });
    }
  }

  console.log("Created notifications");

  console.log("Seed completed successfully!");
}

// ...existing helper functions remain the same...
function generateChapterTitle(): string {
  const titles = [
    "The Journey Begins",
    "Unexpected Encounters",
    "A Twist of Fate",
    "The Mystery Deepens",
    "Revelations",
    "The Final Confrontation",
    "New Beginnings",
    "Dark Secrets",
    "The Truth Unveiled",
    "Echoes of the Past",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateChapterContent(): string {
  return `This is the content of a chapter. It would contain the actual story text, dialogue, and narrative elements that advance the plot and develop the characters. In a real application, this would be much longer and contain the actual creative writing content.

The content here is just placeholder text to demonstrate the structure of the database. Each chapter would typically contain several paragraphs of story content, character development, and plot advancement.

This chapter continues the story and builds upon the previous events, leading the reader deeper into the narrative world that the author has created.`;
}

function generateComment(): string {
  const comments = [
    "Amazing chapter! Can't wait to see what happens next!",
    "Love the character development in this story.",
    "This plot twist caught me completely off guard!",
    "Your writing style is so engaging.",
    "When will the next chapter be published?",
    "This story has become one of my favorites!",
    "The dialogue feels so natural and realistic.",
    "I'm totally invested in these characters now.",
    "Great world-building in this chapter!",
    "Please update soon, I'm hooked!",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

function generateNotificationTitle(type: NotificationType): string {
  switch (type) {
    case NotificationType.new_chapter:
      return "New Chapter Available!";
    case NotificationType.new_follower:
      return "You have a new follower!";
    case NotificationType.story_comment:
      return "New comment on your story";
    default:
      return "Notification";
  }
}

function generateNotificationMessage(type: NotificationType): string {
  switch (type) {
    case NotificationType.new_chapter:
      return "A story you're following has published a new chapter.";
    case NotificationType.new_follower:
      return "Someone started following you!";
    case NotificationType.story_comment:
      return "Someone left a comment on one of your stories.";
    default:
      return "You have a new notification.";
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
