import React, { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Layout,
  Radio,
  Typography,
  Upload,
} from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { ListingType } from "../../lib/graphql/globalTypes";
import {
  BankOutlined,
  HomeOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  iconColor,
  displayErrorMessage,
  displaySuccessNotification,
} from "../../lib/utils";
import { Viewer } from "../../lib/types";
// check antd types
import { UploadRequestOption } from "rc-upload/lib/interface";
import { useMutation } from "react-apollo";
import {
  HostListing as HostListingData,
  HostListingVariables,
} from "../../lib/graphql/mutations/HostListing/__generated__/HostListing";
import { HOST_LISTING } from "../../lib/graphql";
import { useScrollToTop } from "../../lib/hooks";

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

// setting an action prop on <Upload> isn't enough anymore b/c
// mocky.io requires an Origin header to bypass cors
// and setting <Upload headers={{Origin: 'whatever'}} resulted in
// an error on Chrome but this works
const fakeRequest = async ({ onSuccess }: UploadRequestOption) => {
  if (!onSuccess) return;
  onSuccess("ok");
};

export const Host = ({ viewer }: Props) => {
  useScrollToTop();
  const [form] = Form.useForm();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
  const [hostListing, { loading, data }] = useMutation<
    HostListingData,
    HostListingVariables
  >(HOST_LISTING, {
    onCompleted: () => {
      displaySuccessNotification("You've successfully created your listing!");
    },
    onError: (error) => {
      console.log(error);
      displayErrorMessage(
        "Sorry, we weren't able to create your listing, please try again later."
      );
    },
  });

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;

    if (file.status === "uploading") {
      setImageLoading(true);
      return;
    }

    if (file.status === "done" && file.originFileObj) {
      getBase64Value(file.originFileObj, (imageBase64Value) => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }
  };

  const handleHostListing = (event: FormEvent) => {
    event.preventDefault();
    form
      .validateFields()
      .then(
        ({ address, city, state, postalCode, price, numOfGuests, ...rest }) => {
          const fullAddress = `${address}, ${city}, ${state}, ${postalCode}`;

          const input = {
            ...rest,
            numOfGuests: +numOfGuests,
            address: fullAddress,
            image: imageBase64Value,
            price: price * 100,
          };

          hostListing({
            variables: {
              input,
            },
          });
        }
      )
      .catch((error) => {
        displayErrorMessage("Please complete all required form fields");
        return;
      });
  };

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            You'll have to be signed in and connected with Stripe to host a
            listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to our application and have
            connected with Stripe to host new listings. You can sign in at the{" "}
            <Link to="/login">/login</Link> page and connect with Stripe shortly
            after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait...
          </Title>
          <Text type="secondary">We're creating your listing.</Text>
        </div>
      </Content>
    );
  }

  if (data && data.hostListing) {
    return <Navigate to={`/listing/${data.hostListing.id}`} />;
  }

  return (
    <Content className="host-content">
      <Form layout="vertical" onSubmitCapture={handleHostListing} form={form}>
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information
            about your listing.
          </Text>
        </div>

        <Item
          label="Home Type"
          name="type"
          rules={[{ required: true, message: "Please select a home type" }]}
        >
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <BankOutlined color={iconColor} /> <span>Apartment</span>
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeOutlined color={iconColor} /> <span>House</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item
          label="Max # of Guests"
          name="numOfGuests"
          rules={[
            { required: true, message: "Please enter a max number of guests" },
          ]}
        >
          <Input min={1} placeholder="4" />
        </Item>

        <Item
          label="Title"
          extra="Max character count of 45"
          name="title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input
            maxLength={45}
            placeholder="The iconic and luxurious Bel-Air mansion"
          />
        </Item>

        <Item
          label="Description of listing"
          extra="Max character count of 400"
          name="description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
          />
        </Item>

        <Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please enter a address" }]}
        >
          <Input placeholder="251 North Bristol Avenue" />
        </Item>

        <Item
          label="City/Town"
          name="city"
          rules={[{ required: true, message: "Please enter a city" }]}
        >
          <Input placeholder="Los Angeles" />
        </Item>

        <Item
          label="State/Province"
          name="state"
          rules={[{ required: true, message: "Please enter a state" }]}
        >
          <Input placeholder="California" />
        </Item>

        <Item
          label="Zip/Postal Code"
          name="postalCode"
          rules={[{ required: true, message: "Please enter a zip code" }]}
        >
          <Input placeholder="Please enter a zip code for your listing!" />
        </Item>

        <Item
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
          name="image"
          rules={[{ required: true, message: "Please provide a image" }]}
        >
          <div className="host__form-image-upload">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              customRequest={fakeRequest}
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
            >
              {imageBase64Value ? (
                <img src={imageBase64Value} alt="Listing" />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Item>

        <Item
          label="Price"
          extra="All prices in $USD/day"
          name="price"
          rules={[{ required: true, message: "Please enter a price" }]}
        >
          <InputNumber min={0} placeholder="120" />
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};

const beforeImageUpload = (file: File) => {
  const fileIsValidImage =
    file.type === "image/jpeg" || file.type === "image/png";
  const fileIsValidSize = file.size / 1024 / 1024 < 1;

  if (!fileIsValidImage) {
    displayErrorMessage("You're only able to upload valid JPG or PNG files!");
    return false;
  }

  if (!fileIsValidSize) {
    displayErrorMessage(
      "You're only able to upload valid image files of under 1MB in size!"
    );
    return false;
  }

  return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (
  img: File | Blob,
  callback: (imageBase64Value: string) => void
) => {
  const reader = new FileReader();
  reader.readAsDataURL(img);
  reader.onload = () => {
    callback(reader.result as string);
  };
};
