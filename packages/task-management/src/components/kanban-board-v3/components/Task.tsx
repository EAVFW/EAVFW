import { makeStyles } from '@griffel/react';
import { Text, Card, CardHeader } from '@fluentui/react-components';

export const useTaskStyles = makeStyles({
  card: {
    maxWidth: '100%',
    height: 'fit-content',
    marginTop: '12px',
  },
});

export const Task = ({ title, description }: { title: string; description: string }) => {
  const styles = useTaskStyles();

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Text weight="semibold">{title}</Text>}
        description={<Text>{description}</Text>}
      />
    </Card>
  );
};
