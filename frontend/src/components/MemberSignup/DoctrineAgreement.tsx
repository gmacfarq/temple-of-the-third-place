import { Paper, Title, Text, Button, ScrollArea } from '@mantine/core';

interface DoctrineAgreementProps {
  onClose: () => void;
}

export default function DoctrineAgreement({ onClose }: DoctrineAgreementProps) {
  return (
    <Paper p="xl" shadow="md" radius="md" withBorder>
      <Title order={2} mb="md">Temple of the Third Place Doctrine</Title>

      <ScrollArea h={500} mb="md">
        <Text>
          In the heart of our sacred entheogenic plant church, we embrace a profound and inclusive spiritual path that cherishes the wisdom of ancestral knowledge while remaining open to the modern advances and insights. Our purpose is to offer education, safe access, and a nurturing environment for individuals seeking to explore the divine within, and to engage in transformative spiritual experiences with sacred entheogenic plants. We use these entheogenic sacraments to align our past, present and future selves with our desired spirit, helping uncover truths and obtaining balance and order in the physical, spiritual and metaphysical worlds. Our doctrine is a testament to our commitment to compassionate self-discovery, the elevation of humanity, and the evolving nature of spiritual truth.
        </Text>

        <Text mt="md" fw={700}>1. Inclusive Community:</Text>
        <Text>
          We are a community that celebrates the diversity of spiritual traditions and perspectives. We honor the sacredness within all paths, recognizing that we are each other's teachers and that wisdom transcends boundaries.
        </Text>

        <Text mt="md" fw={700}>2. Guiding with Compassion:</Text>
        <Text>
          We offer guidance and support to those who partake in sacred ceremonies and sacraments, believing in the transformative power of these experiences. We approach our members with compassion and empathy.
        </Text>

        <Text mt="md" fw={700}>3. Ever-Evolving Scripture:</Text>
        <Text>
          Our doctrine is not static but adapts to the evolving needs of our community and the world. We remain rooted in our core principles while embracing change and relevance to current events.
        </Text>

        <Text mt="md" fw={700}>4. Guidelines for Self-Compassion:</Text>
        <Text>
          We offer guidelines - not commandments - that focus on cultivating self-compassion. We encourage members to embrace their imperfections, reject shame, and seek self-awareness to navigate themselves and their spiritual journeys.
        </Text>

        <Text mt="md" fw={700}>5. Compassion for Others:</Text>
        <Text>
          Central to our beliefs is the practice of compassion for others. We recognize the interconnectedness of all beings and strive to foster understanding, empathy, and love in our interactions with the world.
        </Text>

        <Text mt="md" fw={700}>6. Honorable Intention and Impact:</Text>
        <Text>
          We emphasize the importance of maintaining an honorable intention in our spiritual practices and understanding the impact of our actions on ourselves, others, and the world at large.
        </Text>

        <Text mt="md" fw={700}>7. Removing Shame and Embracing Mistakes:</Text>
        <Text>
          We reject the notion of shame and acknowledge that every human makes mistakes. Instead, we promote self-awareness and compassion as tools for course correction and finding solutions.
        </Text>

        <Text mt="md">
          In the heart of our sacred entheogenic plant church, we invite all seekers of spiritual truth to join us on a journey of self-discovery, interconnectedness, and compassion.
        </Text>

        <Text mt="md">
          Together, we honor the sacredness of life, the diversity of perspectives, and the ever-unfolding mysteries of the human spirit. In love and understanding, we walk this path, striving to be beacons of light, unity, and hope in a world in need of compassion and wisdom.
        </Text>
      </ScrollArea>

      <Button fullWidth onClick={onClose}>
        Return to Signup
      </Button>
    </Paper>
  );
}