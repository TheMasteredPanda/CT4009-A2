import Investigations from "../schemas/Investigations.schema";
import Investigators from "../schemas/Investigatiors.schema";
import InvestigationImages from "../schemas/InvestigationImages.schema";
import InvestigationComments from "../schemas/InvestigationComments.schema";
import InvestigationUpdates from "../schemas/InvestigationUpdates.schema";
import BikeImages from "../schemas/BikeImages.schema";
import Reports from "../schemas/Reports.schema";
import _ from "lodash";
import {
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";

export async function create(reportId: number, investigatorId: number) {
  let investigation = await Investigations.findOne({
    where: { report_id: reportId, open: true },
  });

  if (investigation) {
    throw new ClientNotAcceptableError(
      "Client",
      "Investigation already present",
      `An open investigation of report ${reportId} already exists.`
    );
  }

  let newInvestigation = await Investigations.create({ report_id: reportId });
  let investigationObject: any = newInvestigation.toJSON();
  let newInvestigator = await Investigators.create({
    investigator_id: investigatorId,
    investigation_id: investigationObject.id,
  });

  return investigationObject.id;
}

export async function getInvestigations(opts: {
  reportId?: number;
  reportAuthor?: number;
}) {
  let query: any = {};

  if (opts.reportId) {
    query.report_id = opts.reportId;
  }

  if (opts.reportAuthor) {
    let reports = await Reports.findAll({
      where: { author: opts.reportAuthor },
    });

    if (!reports) {
      return [];
    }

    let ids = _.map(reports, (report) => (report.toJSON() as any).id);
    query.report_id = ids;
  }

  let investigations = await Investigations.findAll({
    where: query,
    attributes: ["id"],
  });

  return _.map(
    investigations,
    (investigation) => (investigation.toJSON() as any).id
  );
}

export async function close(investigationId: number) {
  let investigation = await Investigations.findOne({
    where: { investigation_id: investigationId },
    attributes: ["open"],
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `Investigation under id ${investigationId} was not found.`
    );
  }

  let object: any = investigation.toJSON();

  if (!object.open) {
    throw new ClientNotAcceptableError(
      "Client",
      "Investigation already closed",
      `Investigation under id ${investigationId} was already closed.`
    );
  }

  await Investigations.update(
    { open: false },
    { where: { investigation_id: investigationId } }
  );
}

export async function getInvestigation(investigationId: number) {
  let investigation = await Investigations.findOne({
    where: { investigation_id: investigationId },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Parameter not found",
      `Investigation under id ${investigationId} was not found.`
    );
  }

  let investigators = await Investigators.findAll({
    where: { investigation_id: investigationId },
  });
  let images = await InvestigationImages.findAll({
    where: { investigation_id: investigationId },
  });
  let imageIds = _.map(images, (image) => (image.toJSON() as any).image_id);
  let bikeImages = await BikeImages.findAll({ where: { image_id: imageIds } });
  let object: any = investigation.toJSON();
  object.investigators = _.map(
    investigators,
    (investigator) => (investigator.toJSON() as any).id
  );
  object.images = _.map(bikeImages, (image) => {
    let imageObject = image.toJSON() as any;

    return { id: imageObject.id, uri: imageObject.uri };
  });

  return object;
}

export async function addInvestigator(
  investigationId: number,
  investigatorId: number
) {
  let investigator = await Investigators.findAll({
    where: {
      investigation_id: investigationId,
      investigator_id: investigatorId,
    },
  });

  if (investigator) {
    throw new ClientNotAcceptableError(
      "Client",
      "User is already an investigator",
      `User under id ${investigatorId} is already an investigator on investigation ${investigationId}.`
    );
  }

  let newInvestigator = await Investigators.create({
    investigation_id: investigationId,
    investigator_id: investigatorId,
  });
  return (newInvestigator.toJSON() as any).id;
}

export async function removeInvestigator(
  investigationId: number,
  investigatorId: number
) {
  let investigator = await Investigators.findOne({
    where: {
      investigator_id: investigatorId,
      investigation_id: investigationId,
    },
  });

  if (!investigator) {
    throw new ClientNotAcceptableError(
      "Client",
      "Investigator not found",
      `Investigator (User) ${investigatorId} for investigation ${investigationId} was not found.`
    );
  }

  await Investigators.destroy({
    where: {
      investigator_id: investigatorId,
      investigation_id: investigationId,
    },
  });
}

export async function createComment(
  comment: string,
  authorId: number,
  investigationId: number
) {
  let investigation = await Investigations.findOne({
    where: { investigation_id: investigationId, open: true },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `An open investigation under id ${investigationId} was not found.`
    );
  }

  let commentModel = await InvestigationComments.create({
    comment,
    author_id: authorId,
    investigation_id: investigationId,
  });
  return (commentModel.toJSON() as any).id;
}

export async function removeComment(commentId: number) {
  await InvestigationComments.destroy({ where: { id: commentId } });
}

export async function addUpdate(
  investigationId: number,
  authorId: number,
  content: string
) {
  let investigation = await Investigations.findOne({
    where: { investigation_id: investigationId },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `Investigation under id ${investigationId} was not found.`
    );
  }

  let updateModel = await InvestigationUpdates.create({
    investigation_id: investigationId,
    author: authorId,
    content,
  });
  return (updateModel.toJSON() as any).id;
}

export async function hideUpdate(updateId: number) {
  await InvestigationUpdates.update(
    { hide: true },
    { where: { id: updateId } }
  );
}

export async function addImage(updateId: number, path: string) {
  let bikeImage = await BikeImages.create({ uri: path });

  let imageModel = await InvestigationImages.create({
    update_id: updateId,
    image_id: (bikeImage.toJSON() as any).id,
  });

  return (imageModel.toJSON() as any).id;
}