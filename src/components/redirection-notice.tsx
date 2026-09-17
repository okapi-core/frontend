import { Anchor, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

export function RedirectionNotice({
  msg,
  link,
  linkLabel,
}: {
  msg: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <Text size="sm" ta="center">
      {msg}{' '}
      <Anchor component={Link} to={link}>
        {linkLabel}
      </Anchor>
    </Text>
  );
}
