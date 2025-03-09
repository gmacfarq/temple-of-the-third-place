import { Paper, Title, Text, Button, ScrollArea } from '@mantine/core';

interface MedicalWaiverProps {
  onClose: () => void;
}

export default function MedicalWaiver({ onClose }: MedicalWaiverProps) {
  return (
    <Paper p="xl" shadow="md" radius="md" withBorder>
      <Title order={2} mb="md">Medical and Liability Release Waiver</Title>

      <ScrollArea h={500} mb="md">
        <Text>
          By confirming my agreement to this waiver, I acknowledge that I have carefully read this document and fully understand its terms and conditions and that this is a medical release and waiver of all liability with regard to any rights I may have to seek compensation in the case of any loss, damage, illness, or injury, including death.
        </Text>

        <Text mt="md">
          I acknowledge the ceremonies I plan to participate in, both with other members of the congregation and by myself, as part of my religious practice, in exercise of my freedom of religion and under protections of the First Amendment of the United States' laws and Constitution. As part of these religious ceremonies, I will consume the psilocybin sacrament. The Sacrament will be consecrated and served in religious and spiritual practice guided in ceremonial settings.
        </Text>

        <Text mt="md">
          To the best of my knowledge, I attest that I am in good physical condition and I am not aware of any physical and/or psychological infirmity that would place me at risk to participate in any way with the Ceremonial activities, including but not limited to former or current head injury, PTSD, schizophrenia, bipolar disorders, or contraindicated medications like SSRIs, MAOIs or heart medications. If any of these are a possibility, I will notify Temple of the Third Place before moving forward with this membership and/or ceremony.
        </Text>

        <Text mt="md">
          I VOLUNTARILY ASSUME FULL RESPONSIBILITY FOR ANY RISK OF LOSS, PROPERTY DAMAGE, ILLNESS, OR PERSONAL INJURY, INCLUDING DEATH, that may be sustained by me, or any loss or damage to property owned by me as a result of being engaged in the Ceremonial activities, no matter the cause, anticipated or unanticipated.
        </Text>

        <Text mt="md">
          I understand that the ceremonial settings in which I voluntarily choose to participate may be physically, mentally, emotionally, and/or spiritually demanding. I understand that I may experience dizziness, nausea or other physical upsets including vomiting and diarrhea. I accept full responsibility for anything that may occur including emotional disturbance, mental disorientation, and any and all possible manifestations of physical, emotional and/or mental changes. I acknowledge that the risks and potential benefits of my participation have been explained to me and I freely choose to enter this process accepting full responsibility for whatever may occur, anticipated or unanticipated.
        </Text>

        <Text mt="md">
          I hereby knowingly and voluntarily assume the full risks of any physical or other injury, damage or losses, either to myself or caused to others by me during any of the Ceremonial settings. I am freely making monetary donations to help cover part of the expenses necessary to support the continuity of these Spiritual and Religious traditions for me and for future generations.
        </Text>

        <Text mt="md">
          I understand I may be physically or mentally exhausted and/or disoriented after the Ceremonies, and I acknowledge that it is my responsibility to arrange alternate transportation, if needed.
        </Text>

        <Text mt="md">
          I understand that although my participation in the Ceremonial settings is purely voluntary, I commit to follow all the instructions given. I commit to stay in the Ceremonial space and at the Ceremony site until the end of the Religious service, and under no circumstances will I leave the premises, either on foot or by any vehicle before I am cleared by the Ceremonial guides to do so.
        </Text>

        <Text mt="md">
          I understand, acknowledge, and agree to the importance of the privacy of the Ceremony, its participants, and the observations made of others during the Ceremony, and agree not to share any of this information and/or observations with anyone. Any emotional or other process that I happen to observe in others during the Ceremony will be kept strictly confidential and I agree to abstain from photographing, filming, or recording anything throughout the duration of the Ceremonies I am present for.
        </Text>

        <Text mt="md">
          FOR GOOD AND VALUABLE CONSIDERATION, THE RECEIPT AND SUFFICIENCY OF WHICH IS HEREBY ACKNOWLEDGED, I DO HEREBY DISCHARGE AND COVENANT NOT TO SUE, AND RELEASE, HOLD HARMLESS, INDEMNIFY, AND FOREVER DISCHARGE TEMPLE OF THE THIRD PLACE, THE CEREMONIAL GUIDES, SACRAMENT ADVISORS, ORGANIZERS, MEMBERS, EMPLOYEES, AGENTS, STAFF, AFFILIATES, REPRESENTATIVES, CONTRACTORS, SUCCESSORS, ASSIGNS, RESPECTIVE HEIRS, PERSONAL REPRESENTATIVES, AND ALL PERSONS, FIRMS OR CORPORATIONS WHO MIGHT BE CLAIMED TO HAVE ANY LIABILITY, WHETHER OR NOT NAMED HEREIN (HEREINAFTER REFERRED TO AS "RELEASEES"), FROM ANY AND ALL LIABILITY FOR ANY LOSS, DAMAGE, EXPENSE OR INJURY, BOTH TO PERSON AND TO PROPERTY, INCLUDING DEATH, THAT I MAY SUFFER OR THAT ANY THIRD PARTY MAY SUFFER AS A RESULT OF MY PARTICIPATION OR IN ANY THIRD PARTY'S PARTICIPATION IN THE CEREMONY AND ANY OTHER RELATED ACTIVITIES, DUE TO ANY CAUSE WHATSOEVER INCLUDING NEGLIGENCE, GROSS NEGLIGENCE, BREACH OF CONTRACT, BREACH OF ANY STATUTORY OR OTHER DUTY OF CARE, AND/OR BREACH OF STANDARD OF CARE, ON THE PART OF THE RELEASEES, AND INCLUDING THE FAILURE ON THE PART OF THE RELEASEES TO SAFEGUARD OR PROTECT ME OR OTHER THIRD PARTIES FROM THE RISKS, DANGERS, AND HAZARDS OF PARTICIPATION IN THE CEREMONY AND ANY OTHER RELATED ACTIVITIES.
        </Text>

        <Text mt="md">
          I understand that the ceremony organizers do not carry personal liability insurance that covers my participation in the Ceremonial settings, and that I have the option to purchase such insurance.
        </Text>

        <Text mt="md">
          I understand and agree that this Medical Waiver and Release of Liability Agreement shall be binding upon my heirs, next of kin, executors, administrators, assignees, representatives, trustees, and guardians in the event of my death or incapacity.
        </Text>

        <Text mt="md">
          I understand and agree that this Medical Waiver and Release of Liability Agreement and any rights, duties, and obligations as between the parties to this Agreement shall be governed by and interpreted solely in accordance with the laws of the State of California and no other jurisdiction, and any litigation involving the parties to this agreement shall be brought solely within the State of California and shall be within the exclusive jurisdiction of the courts of the State of California.
        </Text>

        <Text mt="md">
          It is understood and agreed that this Medical Waiver and Release of Liability Agreement is made in full and complete settlement and satisfaction of the aforesaid actions, causes of action, claims and demands and that this release contains the entire agreement between the parties. In entering this Medical Waiver and Release of Liability Agreement I am not relying on any oral or written representations or statements made by the Releasees with respect to the Ceremonies and related activities other than what is set forth in this Medical Waiver and Release of Liability Agreement.
        </Text>

        <Text mt="md">
          I give permission to the Ceremonial Guides and Organizers to seek medical or other services for any injury or emotional distress.
        </Text>

        <Text mt="md">
          I agree to defend, indemnify, and hold harmless ceremony guides, and religious leaders, and its officers, directors, members, employees, agents, staff, affiliates, representatives, contractors, successors, assigns, respective heirs, and personal representatives from and against any loss, liability, claim, action, or demand, including without limitation reasonable legal and accounting fees, alleging or resulting from my participation in the ceremony or in any related activities.
        </Text>

        <Text mt="md">
          By selecting "I agree to the text above," I am acknowledging and representing, in the same way that a signature would represent, that I have carefully read this document and fully understand its terms and conditions; that I have had time to reflect upon it; that this is a release of all liability; that I accept all of the terms of this agreement voluntarily; and that I am least twenty-one (21) years of age and fully competent. I execute this Medical Waiver and Release of Liability Agreement for full, adequate, and complete considerations and I fully intend to be bound by its terms.
        </Text>
      </ScrollArea>

      <Button fullWidth onClick={onClose}>
        Return to Signup
      </Button>
    </Paper>
  );
}