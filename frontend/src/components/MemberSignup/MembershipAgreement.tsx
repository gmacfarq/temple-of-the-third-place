import { Paper, Title, Text, Button, ScrollArea, List } from '@mantine/core';

interface MembershipAgreementProps {
  onClose: () => void;
}

export default function MembershipAgreement({ onClose }: MembershipAgreementProps) {
  return (
    <Paper p="xl" shadow="md" radius="md" withBorder>
      <Title order={2} mb="md">Temple of the Third Place Membership Agreement</Title>

      <ScrollArea h={500} mb="md">
        <Text fw={700}>Membership Agreement</Text>

        <Text mt="md">
          Welcome to Temple of the Third Place! We are thrilled to have you join our community and embark on a spiritual journey of self-discovery and connection. Please take the time to read our Membership Agreement thoroughly.
        </Text>

        <Text mt="md">
          I hereby apply for membership in a protected collective, Temple of the Third Place. I agree to fully read the agreement below. With the signing of this agreement, I accept the offer made to become a member and I express my agreement with the following:
        </Text>

        <List mt="md" spacing="md">
          <List.Item>
            By becoming a member of Temple of the Third Place, I certify that my participation is in pursuit of a sincere religious exercise. I have read Temple of the Third Place's Doctrine and plan on further exploring my spirituality.
          </List.Item>
          <List.Item>
            I commit to treating all sacraments provided by Temple of the Third Place with utmost sanctity and to consume them solely for sincere religious purposes.
          </List.Item>
          <List.Item>
            I will keep any sacrament in my possession secure and will take all steps reasonably necessary under any given circumstances to ensure that sacrament will not be subject to diversion from religious to non-religious use.
          </List.Item>
          <List.Item>
            I agree not to consume alcohol or illicit drugs while consuming sacraments.
          </List.Item>
          <List.Item>
            I agree to comply with Temple of the Third Place's guidelines and code of conduct, both within and outside ceremonial settings.
          </List.Item>
          <List.Item>
            I agree to never distribute sacrament to anyone who is not a certified member of Temple of the Third Place. I agree to consult Temple of the Third Place administrators if any person's member status is questioned.
          </List.Item>
          <List.Item>
            I agree to consume sacrament only in proper set and setting, and only for purposes of divination, spiritual progress, spiritual healing, and life optimization.
          </List.Item>
          <List.Item>
            I certify that I understand that Temple of the Third Place does not authorize non-religious use of the sacrament and that any use of the sacrament outside of the proscribed religious setting is considered sacrilege and grounds for expulsion from the organization.
          </List.Item>
          <List.Item>
            I agree to attend congregation services, either in-person or virtually, a minimum of once a quarter and/or agrees, in the event they are unable to attend such Service, to watch at least one pre-recorded service per quarter.
          </List.Item>
          <List.Item>
            <Text fw={700}>Membership:</Text>
            <List withPadding>
              <List.Item>Memberships are renewed monthly, and I am expected to maintain an active membership.</List.Item>
              <List.Item>Temple of the Third Place reserves the right to withdraw membership at any time and for any reason if the terms of this agreement are violated.</List.Item>
              <List.Item>I agree to promptly report any member who may be violating the Membership Agreement or Code of Conduct.</List.Item>
            </List>
          </List.Item>
          <List.Item>
            <Text fw={700}>Medical and Liability Waiver:</Text>
            <List withPadding>
              <List.Item>I acknowledge that Temple of the Third Place does not provide medical advice or treatments.</List.Item>
              <List.Item>Before participating in any ceremonial activities or using any sacraments, I agree to seek professional medical advice to ensure that participating in Temple of the Third Place activities and consuming sacraments does not pose any risks or conflicts with my health, prior conditions or medications.</List.Item>
              <List.Item>I assume full responsibility for my participation in Temple of the Third Place activities, ceremonies and consumption of sacrament, understanding that these activities involve inherent risks.</List.Item>
              <List.Item>I have read and agreed to the Medical and Liability Release Waiver</List.Item>
            </List>
          </List.Item>
          <List.Item>
            <Text fw={700}>Law Enforcement Clause</Text>
            <List withPadding>
              <List.Item>This agreement acknowledges and affirms the principles of the separation of church and state as outlined in relevant laws and regulations. By becoming a member of Temple of the Third Place, the undersigned member agrees to abide by this principle and understands that their role as a law enforcement officer is separate from their affiliation with the church</List.Item>
            </List>
          </List.Item>
          <List.Item>
            <Text fw={700}>Anonymity and Confidentiality</Text>
            <List withPadding>
              <List.Item>Anonymity and confidentiality shall be considered extremely important to the members. Members shall not at any point in time for any reason divulge personal information about any member, including telling people inside or outside the membership the identity of other members. Signing member waives any rights they may have to violate the aforementioned anonymity clause and shall be personally liable shall any violation be related to them or any members that they bring into membership by referral.</List.Item>
            </List>
          </List.Item>
        </List>

        <Text mt="md" fw={700}>
          **MEMBERS AGREE AND ACKNOWLEDGE THAT TEMPLE OF THE THIRD PLACE MAY, AT ITS DISCRETION, PERFORM A COMPREHENSIVE BACKGROUND CHECK ON A MEMBER IN ORDER TO ENSURE SINCERITY.**
        </Text>

        <Text mt="md">
          By agreeing below, I affirm to be 21 years of age or older, and I agree to the principles and terms of this private membership agreement and wish to become a member in this group. I affirm my commitment to the principles and beliefs of Temple of the Third Place and our shared journey of spiritual growth and nature connection.
        </Text>

        <Text mt="md">
          By checking the box below, you are consenting to the use of your electronic signature in lieu of an original signature on paper. You have the right to request that you sign a paper copy instead. By checking here, you are waiving that right. After consent, you may, upon written request to us, obtain a paper copy of an electronic record. No fee will be charged for such copy. Your agreement to use an electronic signature with us for any documents will continue until such time as you notify us in writing that you no longer wish to use an electronic signature. There is no penalty for withdrawing your consent. You should always make sure that we have a current email address in order to contact you regarding any changes, if necessary.
        </Text>
      </ScrollArea>

      <Button fullWidth onClick={onClose}>
        Return to Signup
      </Button>
    </Paper>
  );
}