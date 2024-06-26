import { useMemo, useState } from 'react';
import { useListModelsQuery } from '@/apollo/client/graphql/model.generated';
import {
  convertObjectToIdentifier,
  convertIdentifierToObject,
} from '@/utils/enum';
import { RelationsDataType } from '@/components/table/ModelRelationSelectionTable';
import { RelationFormValues } from '@/components/modals/RelationModal';

interface Props {
  // The initial base model of model select
  model?: string;
  // The models to be excluded from model select
  excludeModels?: string[];
}

// for identifier keys
const modelKeys = ['id', 'name'];
const fieldKeys = ['id', 'referenceName'];

export const convertFormValuesToIdentifier = (
  relationFormValues: RelationFormValues,
) => {
  const fromModel: { id: string; name: string } = convertIdentifierToObject(
    relationFormValues.fromField.model,
  );

  const fromField: { id: string; referenceName: string } =
    convertIdentifierToObject(relationFormValues.fromField.field);

  const toModel: { id: string; name: string } = convertIdentifierToObject(
    relationFormValues.toField.model,
  );

  const toField: { id: string; referenceName: string } =
    convertIdentifierToObject(relationFormValues.toField.field);

  return {
    ...relationFormValues,
    fromField: {
      modelId: fromModel.id,
      modelName: fromModel.name,
      fieldId: fromField.id,
      fieldName: fromField.referenceName,
    },
    toField: {
      modelId: toModel.id,
      modelName: toModel.name,
      fieldId: toField.id,
      fieldName: toField.referenceName,
    },
  } as RelationsDataType;
};

export const convertDefaultValueToIdentifier = (defaultValue) => {
  const fromField = {
    model: {
      id: defaultValue.fromField.modelId,
      name: defaultValue.fromField.modelName,
    },
    field: {
      id: defaultValue.fromField.fieldId,
      referenceName: defaultValue.fromField.fieldName,
    },
  };
  const toField = {
    model: {
      id: defaultValue.toField.modelId,
      name: defaultValue.toField.modelName,
    },
    field: {
      id: defaultValue.toField.fieldId,
      referenceName: defaultValue.toField.fieldName,
    },
  };
  return {
    fromField: {
      model: convertObjectToIdentifier(fromField.model, modelKeys),
      field: convertObjectToIdentifier(fromField.field, fieldKeys),
    },
    toField: {
      model: convertObjectToIdentifier(toField.model, modelKeys),
      field: convertObjectToIdentifier(toField.field, fieldKeys),
    },
    type: defaultValue.type,
  };
};

export default function useCombineFieldOptions(props: Props) {
  const { model, excludeModels } = props;

  const [baseModel, setBaseModel] = useState<string>(model || '');

  const { data } = useListModelsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const allModels = useMemo(() => {
    if (!data) return [];

    return data.listModels.map((model) => ({
      id: model.id,
      name: model.referenceName,
      fields: model.fields,
    }));
  }, [data]);

  const filteredModels = useMemo(
    () =>
      allModels.filter(
        (item) => !(excludeModels && excludeModels.includes(item.name)),
      ),
    [excludeModels, baseModel, data],
  );

  const modelOptions = useMemo(
    () =>
      filteredModels.map((model) => ({
        label: model.name,
        value: convertObjectToIdentifier(model, modelKeys),
      })),
    [filteredModels],
  );

  const filteredModel = useMemo(
    () => filteredModels.find((item) => item.name === baseModel),
    [modelOptions, baseModel],
  );

  const fieldOptions = useMemo(
    () =>
      (filteredModel?.fields || []).map((field) => ({
        label: field.referenceName,
        value: convertObjectToIdentifier(field, fieldKeys),
      })),
    [filteredModel],
  );

  return { modelOptions, fieldOptions, onModelChange: setBaseModel };
}
